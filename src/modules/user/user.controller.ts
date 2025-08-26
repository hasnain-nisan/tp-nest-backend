import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { User } from 'src/entities/User.entity';
import { BooleanEmptyToUndefinedPipe } from 'src/common/pipes/boolean-empty-to-undefined.pipe';

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
  @ApiMessage('User updated successfully')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.userService.update(id, dto, user, req.transactionManager);
  }

  @Delete(':id')
  @ApiMessage('User deleted successfully')
  softDelete(
    @Param('id') id: string,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.userService.softDelete(id, user, req.transactionManager);
  }

  @Get(':id')
  @ApiMessage('User fetched successfully')
  getSingle(@Param('id') id: string, @Req() req: RequestWithTransaction) {
    return this.userService.getSingle(id, req.transactionManager);
  }

  @Get()
  @ApiMessage('Users fetched successfully')
  getAllPaginated(
    @Req() req: RequestWithTransaction,
    @Query(new BooleanEmptyToUndefinedPipe())
    filters: {
      email?: string;
      role?: 'SuperAdmin' | 'Admin';
      isDeleted?: boolean;
      canManageUsers?: boolean;
      canManageClients?: boolean;
      canManageStakeholders?: boolean;
      canManageProjects?: boolean;
      canManageInterviews?: boolean;
    },
    @Query('sortField') sortField?: keyof User,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const sort =
      sortField && sortOrder
        ? { field: sortField, order: sortOrder }
        : undefined;
    return this.userService.getAllPaginated(
      page,
      limit,
      filters,
      sort,
      req.transactionManager,
    );
  }
}
