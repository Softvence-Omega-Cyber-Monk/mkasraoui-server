import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { SeederService } from './seeder/seeder.service';

import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { UserModule } from './module/user/user.module';
import { ProductsModule } from './module/products/products.module';
import { ReviewModule } from './module/review/review.module';
import { ProviderReviewModule } from './module/provider-review/provider-review.module';
import { QuoteModule } from './module/quote/quote.module';
import { MailModule } from './module/mail/mail.module';
import { InvitationsModule } from './module/invitations/invitations.module';

// import { PaymentModule } from './module/payment/payment.module';
import { OrderModule } from './module/order/order.module';
import { FavoriteModule } from './module/favorite/favorite.module';
import { BlogModule } from './module/blog/blog.module';
import { ChatModule } from './module/chat/chat.module';
import { NewsLetterModule } from './module/news-letter/news-letter.module';
import { PlanModule } from './module/plan/plan.module';
import { SubscriptionModule } from './module/subscription/subscription.module';
import { ProviderPlanModule } from './module/provider-plan/provider-plan.module';
import { SubscriptionMailTemplatesService } from './module/mail/subscription.mail';
import { AdminModule } from './module/admin/admin.module';
import { ChecklistModule } from './module/checklist/checklist.module';
import { CustomTshirtModule } from './module/custom-tshirt/custom-tshirt.module';
import { PartGenerationModule } from './module/part-generation/part-generation.module';
import { BullModule } from '@nestjs/bull';
import { ProviderPaymentModule } from './module/provider-payment/provider-payment.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
     ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/', 
      renderPath: '/',
    }),
    BullModule.forRoot({
      redis: process.env.REDIS_URL, 
    }),
    BullModule.registerQueue({
      name: 'mail',
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: process.env.EMAIL_USER,
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    MulterModule,
    UserModule,

    ReviewModule,
    ProviderReviewModule,
    QuoteModule,
    MailModule,
    InvitationsModule,
    OrderModule,
    FavoriteModule,
    BlogModule,
    ChatModule,
    NewsLetterModule,
    PlanModule,
    SubscriptionModule,
    ProviderPlanModule,
    AdminModule,
    ChecklistModule,
    CustomTshirtModule,
    PartGenerationModule,
    ProviderPaymentModule,
    // PaymentModule
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
