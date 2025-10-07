import { BadRequestException, HttpException, HttpStatus, Injectable, RawBodyRequest } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SubscriptionMailTemplatesService } from '../mail/subscription.mail';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe

  constructor(private prisma: PrismaService, private mailService: MailService, private subscriptionService: SubscriptionMailTemplatesService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
  }
  async create_subscription(createSubscriptionDto: CreateSubscriptionDto, userId: string) {
    const { priceId, pland_id } = createSubscriptionDto;
    
    // 1. Initial Data Fetch (Your existing Promise.all)
    const [isPlanExist, is_alrady_use_same_plan, user, prodvider_plan] = await Promise.all([
      this.prisma.plan.findUnique({
        where: { id: pland_id }
      }),
      this.prisma.subscription.findFirst({
        where: {
          user_id: userId,
          plan_id: pland_id,
        }
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { stripe_customer_id: true, email: true }
      }),
      this.prisma.provider_plan.findUnique({
        where: { id: pland_id }
      }),
    ]);

    // 2. Validation Checks (Your existing logic)
    if (!user) {
      throw new HttpException("User not found", 404);
    } else if (!isPlanExist && !prodvider_plan) {
      throw new HttpException("Plan does not exist", 404);
    } else if (isPlanExist && !isPlanExist.is_active) {
      throw new HttpException("Plan is not active", HttpStatus.BAD_REQUEST);
    } else if (is_alrady_use_same_plan) {
      throw new HttpException("You are already subscribed to this plan", HttpStatus.BAD_REQUEST);
    }

    let stripeCustomerId = user.stripe_customer_id;
    try {
      if (!stripeCustomerId) {
        console.log(`Stripe customer ID missing for user ${userId}. Creating new customer...`);
        const stripeCustomer = await this.stripe.customers.create({
          email: user.email,
          metadata: { application_user_id: userId }
        });
        await this.prisma.user.update({
          where: { id: userId },
          data: { stripe_customer_id: stripeCustomer.id },
        });
        stripeCustomerId = stripeCustomer.id;
        console.log(`New Stripe Customer ID created: ${stripeCustomerId}`);
      }

      const price = await this.stripe.prices.retrieve(priceId);

      const session = await this.stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: price.recurring ? 'subscription' : 'payment',
        success_url: `${process.env.CLIENT_URL}/success` as string,
        cancel_url: `${process.env.CLIENT_URL}/cancel`  as string,
        client_reference_id: userId,
        subscription_data: {
          metadata: {
            plan_id: (isPlanExist || prodvider_plan)?.id || '',
            user_id: userId
          }
        },
      });

      return { url: session.url };

    } catch (error) {
      if (error.message && error.message.includes("No such customer")) {

        console.warn(`[RETRY] Invalid customer ID: '${stripeCustomerId}' for user ${userId}. Clearing ID and retrying...`);
        await this.prisma.user.update({
          where: { id: userId },
          data: { stripe_customer_id: null },
        });
        return this.create_subscription(createSubscriptionDto, userId);

      } else {
        console.error("Stripe API error encountered:", error);
        throw new HttpException("Payment processing error", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
  async handleWebhook(req: RawBodyRequest<Request>) {
    let event: Stripe.Event;
    const rawBody = req.rawBody;
    console.log(rawBody);
    const signature = req.headers['stripe-signature'] as string;
    if (!rawBody) {
      throw new BadRequestException('No webhook payload was provided in subscription.');
    }

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe signature');
    }

    //  ----------------------------Handle important events--------------------------
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Payment received!');

        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.parent?.subscription_details?.metadata) {
          const subscriptionMetadata = invoice.parent.subscription_details.metadata;
          const userId = subscriptionMetadata.user_id;
          const planId = subscriptionMetadata.plan_id;
          const plan = await this.prisma.plan.findUnique({
            where: { id: planId }
          });
          const existingSubscription = await this.prisma.subscription.findFirst({
            where: { user_id: userId }
          });

          if (existingSubscription) {
            const now = new Date();
            let endData: any;
            if (plan?.plan_duration === "MONTHLY") {
              endData = new Date(now.setMonth(now.getMonth() + 1));
            } else if (plan?.plan_duration === "YEARLY") {
              endData = new Date(now.setFullYear(now.getFullYear() + 1));
            }
            await this.prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                plan_id: planId,
                start_data: new Date(),
                end_date: endData,
                plan_name: plan?.name,
                price: plan?.price
              },
              include: { plan: true, user: true }
            });
          }
        }
        break;
      case 'customer.subscription.created':
        const createdSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', createdSubscription.id);
        const userIdToPromote = createdSubscription.metadata.user_id;
        const planIdToAssign = createdSubscription.metadata.plan_id;

        if (!userIdToPromote || !planIdToAssign) {
          console.error('Missing user_id or plan_id in subscription metadata. Aborting.');
          return;
        }
        const [user, plan] = await Promise.all([
          this.prisma.user.findUnique({
            where: { id: userIdToPromote },
            select: { id: true, email: true, name: true }
          }),
          this.prisma.plan.findUnique({
            where: { id: planIdToAssign },
            select: { name: true }
          })
        ]);
        if (user?.email) {
          const planName = plan?.name || 'Your Subscription Plan';
          const userName = user.name || user.email.split('@')[0];
          const interval = createdSubscription.items.data[0]?.plan?.interval;
          const intervalText = interval ? ` (${interval.charAt(0).toUpperCase() + interval.slice(1)})` : '';
        const html=  await this.subscriptionService.generateSubscriptionActivatedHtml(
            user.email,
            userName,
            planName,
            createdSubscription.id,
            new Date(),
            intervalText,
            
          );
           await this.mailService.sendMail({
        to:user.email,
        subject: `Subscription Activated: ${planName}`,
        html: html,
    });
          console.log(`Activation email sent to ${user.email} for plan ${planName}.`);
        } else {
          console.error(`User or user email not found for ID: ${userIdToPromote}. Cannot send activation email.`);
        }
        break;


      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const userIdToDemote = deletedSubscription.metadata.user_id;
        if (userIdToDemote) {
          const existingSubscription = await this.prisma.subscription.findFirst({
            where: { user_id: userIdToDemote }
          });
          await this.prisma.subscription.update({
            where: { id: existingSubscription?.id },
            data: {
              plan_id: null,
              start_data: new Date(),
              end_date: null,
              plan_name: "FREE",
            },
            include: { plan: true, user: true }
          })
        }
        break;

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return { received: true };
  }
}
