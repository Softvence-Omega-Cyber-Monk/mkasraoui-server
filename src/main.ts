import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtGuard } from './common/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PrismaService } from './prisma/prisma.service';
import { setupSwagger } from './swagger/swagger.setup';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });




  app.enableCors({
   origin: [
    'http://localhost:5173',  
  ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


   // ✅ Stripe webhook: keep raw body
  app.use(
    '/payments/webhook',
    bodyParser.raw({ type: 'application/json' })
  );

  const reflector = app.get(Reflector);
  const prisma = app.get(PrismaService);

  app.useGlobalGuards(
    new JwtGuard(reflector, prisma),
    new RolesGuard(reflector),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipUndefinedProperties: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
