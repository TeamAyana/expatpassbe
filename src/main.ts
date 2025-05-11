import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableVersioning({
    type: VersioningType.URI,
  })
  app.use(helmet());
  app.enableCors({
    origin: 'http://your-frontend-url.com', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Authentication service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
