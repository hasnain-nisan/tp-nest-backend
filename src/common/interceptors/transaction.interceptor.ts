import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Observable, throwError, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    transactionManager?: EntityManager;
  }
}

function isQueryFailedError(
  error: unknown,
): error is { name: string; code: string; detail?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    'code' in error
  );
}

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransactionInterceptor.name);

  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    return from(
      this.dataSource.transaction(async (manager) => {
        request.transactionManager = manager;

        return next
          .handle()
          .pipe(
            map((data: unknown) => data),
            catchError((err: unknown) => {
              const error =
                err instanceof Error
                  ? err
                  : new InternalServerErrorException(
                      'Unexpected error occurred',
                    );

              this.logger.error(
                '❌ Transaction failed',
                error.stack || error.message,
              );

              // Handle Postgres unique constraint errors
              if (
                isQueryFailedError(error) &&
                error.name === 'QueryFailedError' &&
                error.code === '23505'
              ) {
                throw new ConflictException({
                  statusCode: 409,
                  message: 'Duplicate entry found.',
                  errors: error.detail ?? 'No detail provided',
                });
              }

              // Fallback for database errors
              if (error.name === 'QueryFailedError') {
                return throwError(
                  () =>
                    new InternalServerErrorException({
                      statusCode: 500,
                      message: 'Database query failed',
                      errors: isQueryFailedError(error)
                        ? (error.detail ?? 'No detail provided')
                        : 'Unknown error',
                    }),
                );
              }

              // Other errors
              return throwError(
                () =>
                  new InternalServerErrorException({
                    statusCode: 500,
                    message: error.message || 'Unexpected error occurred',
                  }),
              );
            }),
          )
          .toPromise();
      }),
    );
  }
}
