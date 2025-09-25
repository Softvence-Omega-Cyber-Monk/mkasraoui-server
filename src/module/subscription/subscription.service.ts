import { BadRequestException, HttpException, HttpStatus, Injectable, RawBodyRequest } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
  }
  async create_subscription(createSubscriptionDto: CreateSubscriptionDto, userId: string) {
    const { priceId, pland_id } = createSubscriptionDto;

    const [isPlanExist, is_alrady_use_same_plan, user] = await Promise.all([
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
      })
    ]);

    // ------------------ Validation Checks----------------------- ---
    if (!user) {
      throw new HttpException("User not found", 404);
    } else if (!isPlanExist) {
      throw new HttpException("Plan does not exist", 404);
    } else if (!isPlanExist.is_active) {
      throw new HttpException("Plan is not active", HttpStatus.BAD_REQUEST);
    } else if (is_alrady_use_same_plan) {
      throw new HttpException("You are already subscribed to this plan", HttpStatus.BAD_REQUEST);
    }
    let stripeCustomerId = user.stripe_customer_id;

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
      success_url: process.env.CLIENT_URL_SUCCESSFUL as string,
      cancel_url: process.env.CLIENT_URL_CANCEL as string,
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          plan_id: isPlanExist.id,
          user_id: userId
        }
      },
    });
    return { url: session.url };
  }


  async handleWebhook(req: RawBodyRequest<Request>) {
    let event: Stripe.Event;
    const rawBody = req.rawBody;
    console.log(rawBody);
    const signature = req.headers['stripe-signature'] as string;
    if (!rawBody) {
      throw new BadRequestException('No webhook payload was provided.');
    }

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        "whsec_xCqIv09l79FgqbcoMRXjJwdDBNngRfON",
      );
    } catch {
      throw new BadRequestException('Invalid Stripe signature');
    }

    //  Handle important events
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
            let endData:any;
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
              },
              include: { plan: true, user: true }
            });
          }
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
