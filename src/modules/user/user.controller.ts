import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import type { JwtPayload } from 'src/common/interfaces/types.interface';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AccessScopes } from 'src/common/decorators/access-scopes.decorator';
import type { RequestWithTransaction } from 'src/common/interfaces/request-with-manager.interface';
import { UpdateUserDto } from './dtos/update-user.dto';

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
  create(
    @Req() req: RequestWithTransaction,
    @Body() dto: CreateUserDto,
    @AuthUser() user: JwtPayload,
  ) {
    return this.userService.create(dto, user, req.transactionManager);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.userService.update(id, dto, user, req.transactionManager);
  }
}
