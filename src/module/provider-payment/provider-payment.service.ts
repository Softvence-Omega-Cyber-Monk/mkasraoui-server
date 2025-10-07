import { Injectable, BadRequestException, NotFoundException, RawBodyRequest } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class ProviderPaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' as any });
  }

  // 1️⃣ Generate Stripe onboarding link
async getOnboardingLink(userId: string) {
  const provider = await this.prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) throw new NotFoundException('Provider profile not found');
  if (!provider.stripe_account_id) throw new BadRequestException('Stripe account not created');

  // Check if onboarding is already complete
  const account = await this.stripe.accounts.retrieve(provider.stripe_account_id);
  const onboardingComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled;

  if (onboardingComplete) {
    throw new BadRequestException('Onboarding already completed. No link needed.');
  }

  // Generate onboarding link
  const accountLink = await this.stripe.accountLinks.create({
    account: provider.stripe_account_id,
    refresh_url: `${process.env.CLIENT_URL}/onboarding/refresh`,
    return_url: `${process.env.CLIENT_URL}/dashboard`,
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
}

async isOnboardingComplete(userId: string) {
  const provider = await this.prisma.providerProfile.findUnique({ where: { userId } });
  if (!provider || !provider.stripe_account_id) throw new NotFoundException('Stripe account not found');

  const account = await this.stripe.accounts.retrieve(provider.stripe_account_id);
  const completed = account.details_submitted && account.charges_enabled && account.payouts_enabled;
  return {
    completed,      
  };
}




async getLoginLink(userId: string) {
  const provider = await this.prisma.providerProfile.findUnique({ where: { userId } });
  if (!provider || !provider.stripe_account_id) throw new NotFoundException('Stripe account not found');

  // ⚠️ Remove redirect_url
  const loginLink = await this.stripe.accounts.createLoginLink(provider.stripe_account_id);

  return { url: loginLink.url };
}



async createCheckoutSession(userId: string, quoteId: string) {
  const quote = await this.prisma.quote.findUnique(
    { where: { id: quoteId },
     include:{
      user:true
     }
  });
  if (!quote || quote.status !== 'BOOKED') {
    throw new BadRequestException('Invalid quote');
  }

  const provider = await this.prisma.providerProfile.findUnique({ where: { id: quote.providerId } });
  if (!provider || !provider.stripe_account_id) {
    throw new NotFoundException('Provider Stripe account not found');
  }

  const session = await this.stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Quote #${quote.id}`,
            description: 'Service booking payment',
          },
          unit_amount: Math.round(quote.price * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    payment_intent_data: {
      transfer_data: {
        destination: provider.stripe_account_id,
      },
      metadata: { quoteId: quote.id, userId },
    },
    customer_email:quote.user.email,
    metadata: { quoteId: quote.id, userId },
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
  });

  return { url: session.url };
}

async handleWebhook(req: RawBodyRequest<Request>) {
    let event: Stripe.Event;
    const rawBody = req.rawBody;
    console.log(rawBody);
    const signature = req.headers['stripe-signature'] as string;
    if (!rawBody) {
      throw new BadRequestException('No webhook payload was provided in Provider service payment.');
    }

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET_PROVIDER_PAYMENT as string,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe signature');
    }

    //  ----------------------------Handle important events--------------------------
  switch (event.type) {
    // ✅ Handle successful Stripe Checkout session
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const quoteId = session.metadata?.quoteId;

      if (quoteId) {
        await this.prisma.quote.update({
          where: { id: quoteId },
          data: { status: 'PAID' },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

    return { received: true };
  }






  // 2️⃣ Get provider payout/balance info
  async getBalance(userId: string) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!provider || !provider.stripe_account_id) {
      throw new NotFoundException('Provider Stripe account not found');
    }

    const balance = await this.stripe.balance.retrieve({ stripeAccount: provider.stripe_account_id });
    return balance;
  }

  // 3️⃣ List all payments for the provider (quote payments)
  async getProviderPayments(userId: string, page = 1, limit = 10) {
    const provider = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException('Provider profile not found');

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.quote.findMany({
        where: { providerId: provider.id, status: 'PAID' },
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quote.count({ where: { providerId: provider.id, status: 'PAID' } }),
    ]);

    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    };
  }
}
