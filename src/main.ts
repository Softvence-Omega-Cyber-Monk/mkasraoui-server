import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtGuard } from './common/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PrismaService } from './prisma/prisma.service';
import { setupSwagger } from './swagger/swagger.setup';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import * as express from 'express';
import * as fs from 'fs';
import { TransformInterceptor } from './common/decorators/response.interceptor';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser:true
  });


    app.enableCors({
    origin: ['http://localhost:5173',
      'https://ai-party-generator.vercel.app',
      "https://mafetefacile.com",
      'https://mafetefacile.net',
      'https://mafetefacile.fr'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  app.use('/provider/payment/webhook', (req, res, next) => {
  bodyParser.raw({ type: 'application/json' })(req, res, (err) => {
    if (err) return next(err);
    req.rawBody = req.body;
    next();
  });
  });

  app.use('/custom-orders/webhook', (req, res, next) => {
  bodyParser.raw({ type: 'application/json' })(req, res, (err) => {
    if (err) return next(err);
    req.rawBody = req.body;
    next();
  });
  });

  app.use('/orders/webhook', (req, res, next) => {
  bodyParser.raw({ type: 'application/json' })(req, res, (err) => {
    if (err) return next(err);
    req.rawBody = req.body;
    next();
  });
  });


  app.use(
    'subscription/webhook',
    bodyParser.raw({ type: 'application/json' })
  );


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const publicDir = join(process.cwd(), 'public');
  // Ensure uploads folder exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads folder at', uploadsDir);
  }

  // Serve uploads statically
  app.use('/uploads', express.static(uploadsDir));
  app.use('/', express.static(publicDir));


  


  const reflector = app.get(Reflector);
  const prisma = app.get(PrismaService);

  app.useGlobalGuards(new JwtGuard(reflector, prisma), new RolesGuard(reflector));

   app.useGlobalInterceptors(new TransformInterceptor());
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
  console.log(`Server running on port ${process.env.PORT ?? 3000}`);
}

bootstrap();
