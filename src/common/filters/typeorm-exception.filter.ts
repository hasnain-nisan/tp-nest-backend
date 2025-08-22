import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost): Response {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const err = exception as QueryFailedError & {
      code?: string;
      detail?: string;
      constraint?: string;
    };

    // Handle PostgreSQL duplicate key violations
    if (err.code === '23505') {
      // Example detail: 'Key (category_group_id)=(1) already exists.'
      const fieldMatch = err.detail?.match(/\(([^)]+?)\)=\(([^)]+?)\)/);
      const field = fieldMatch?.[1];
      const value = fieldMatch?.[2];

      const friendlyMessage =
        field && value
          ? `The value '${value}' is already used for '${field}'. Please use a different value.`
          : 'A duplicate value was found for a unique field. Please ensure all values are unique.';

      return response.status(409).json({
        statusCode: 409,
        message: friendlyMessage,
        error: 'Conflict',
      });
    }

    if (err.code === '22P02') {
      const detail = err.detail ?? exception.message;

      const isUuidError =
        /uuid/i.test(detail) || /invalid input syntax/.test(detail);

      return response.status(400).json({
        statusCode: 400,
        message: isUuidError
          ? 'Invalid UUID format provided. Please make sure all IDs are valid UUIDs.'
          : 'Invalid input syntax. Please check your request values.',
        error: 'BadRequest',
      });
    }

    // Handle foreign key constraint violations
    if (err.code === '23503') {
      const detailMessage =
        err.detail ?? 'A reference to a non-existent entity was made.';

      return response.status(400).json({
        statusCode: 400,
        message: `Foreign key violation: ${detailMessage}`,
        error: 'ForeignKeyConstraintError',
      });
    }

    // Fallback for all other DB errors
    return response.status(500).json({
      statusCode: 500,
      message: 'An unexpected database error occurred.',
      error: 'ServerError',
    });
  }
}
