import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../interfaces/types.interface';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      'accessScopes',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request>() as RequestWithUser;
    const user = request.user;

    if (!user || typeof user.accessScopes !== 'object') {
      throw new ForbiddenException('Access denied: missing access scopes');
    }

    const hasAllScopes = requiredScopes.every(
      (scope) => user.accessScopes[scope] === true,
    );

    if (!hasAllScopes) {
      throw new ForbiddenException('Access denied: insufficient access scopes');
    }

    return true;
  }
}
