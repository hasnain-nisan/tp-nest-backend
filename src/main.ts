import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { TransformResponseInterceptor } from './common/interceptors/transform.interceptor';
import { flattenValidationErrors } from './common/utils/validation.helper';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Enable CORS here
  app.enableCors({
    origin: true,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: process.env.CORS_CREDENTIALS ?? true,
  });

  const reflector = app.get(Reflector);

  // exclude sensitive data from responses
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new TransformResponseInterceptor(reflector),
  );

  // modify validation pipe to handle errors globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTOs
      forbidNonWhitelisted: true, // Throw error if extra props are present
      transform: true, // Transform payloads to DTO instances
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = flattenValidationErrors(validationErrors);
        const firstField = Object.keys(errors)[0];
        const firstMessage = errors[firstField]?.[0] ?? 'Validation failed';

        return new BadRequestException({
          statusCode: 400,
          message: firstMessage,
          errors,
        });
      },
    }),
  );

  app.useGlobalFilters(new TypeOrmExceptionFilter());

  // useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
