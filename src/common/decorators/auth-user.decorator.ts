// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { RequestWithUser } from '../interfaces';
// import { JwtPayload } from 'src/types/auth.types';

// export const AuthUser = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext): JwtPayload => {
//     const request = ctx.switchToHttp().getRequest<RequestWithUser>();
//     return request.user;
//   },
// );
