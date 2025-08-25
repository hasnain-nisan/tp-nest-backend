import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import type { JwtPayload } from 'src/common/interfaces/types.interface';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AccessScopes } from 'src/common/decorators/access-scopes.decorator';

@Controller({
  path: 'user',
  version: '1',
})
@UseGuards(JwtAuthGuard, AccessControlGuard)
@AccessScopes('canManageUsers')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiMessage('User created successfully')
  create(@Body() dto: CreateUserDto, @AuthUser() user: JwtPayload) {
    return this.userService.create(dto, user);
  }
}
