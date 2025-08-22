import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_MESSAGE_KEY } from '../decorators/api-message.decorator';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<unknown, { message: string; data: T }>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<{ message: string; data: T }> {
    const handler = context.getHandler();
    const defaultMessage = 'Request successful';
    const apiMessage: string =
      this.reflector.get<string>(API_MESSAGE_KEY, handler) ?? defaultMessage;

    return next.handle().pipe(
      map((responseData): { message: string; data: T } => {
        const message =
          responseData &&
          typeof responseData === 'object' &&
          'API_MESSAGE' in responseData &&
          typeof responseData.API_MESSAGE === 'string'
            ? responseData.API_MESSAGE
            : apiMessage;
        const data =
          responseData &&
          typeof responseData === 'object' &&
          'API_MESSAGE' in responseData
            ? { ...responseData, API_MESSAGE: undefined }
            : responseData;
        return {
          message,
          data: data as T,
        };
      }),
    );
  }
}
