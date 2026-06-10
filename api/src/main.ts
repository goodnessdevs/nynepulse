import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { ResponseInterceptor } from './response/response.interceptor';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression())
  app.use(cookieParser())

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseInterceptor())

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'development',
    exceptionFactory: (errors) => {
      console.error('Validation errors:', JSON.stringify(errors, null, 2)); // ← add this
      return new BadRequestException(errors);
    },
  }))

  app.useGlobalFilters(new HttpExceptionFilter())

  const config = new DocumentBuilder().setTitle("NynePulse API").setDescription("IoT Device Management API").setVersion("1.0").addBearerAuth().build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(3000);

  console.log('NynePulse API running on http://localhost:3000');
  console.log('Swagger docs at http://localhost:3000/api/docs');
}
bootstrap();
