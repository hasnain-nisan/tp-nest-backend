/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class BooleanEmptyToUndefinedPipe implements PipeTransform {
  transform(value: Record<string, any>): Record<string, any> {
    if (!value || typeof value !== 'object') return value;

    const result: Record<string, any> = {};

    for (const key in value) {
      const val = value[key];
      if (val === '') {
        result[key] = undefined;
      } else {
        result[key] = val;
      }
    }

    return result;
  }
}
