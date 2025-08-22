import { ValidationError } from '@nestjs/common';
import { formatFieldName } from './helper';

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath: string = '',
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const error of errors) {
    const fullPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      result[fullPath] = Object.values(error.constraints).map((msg) =>
        msg.replace(error.property, formatFieldName(error.property)),
      );
    }

    if (error.children && error.children.length > 0) {
      const childErrors = flattenValidationErrors(error.children, fullPath);
      Object.assign(result, childErrors);
    }
  }

  return result;
}
