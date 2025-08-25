import { SetMetadata } from '@nestjs/common';

export const AccessScopes = (...scopes: string[]) =>
  SetMetadata('accessScopes', scopes);
