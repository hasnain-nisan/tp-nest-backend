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
import { CreateClientStakeholderDto } from './dtos/create-clientStakeholder.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import type { JwtPayload } from 'src/common/interfaces/types.interface';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AccessScopes } from 'src/common/decorators/access-scopes.decorator';
import type { RequestWithTransaction } from 'src/common/interfaces/request-with-manager.interface';
import { UpdateClientStakeholderDto } from './dtos/update-clientStakeholder.dto';
import { BooleanEmptyToUndefinedPipe } from 'src/common/pipes/boolean-empty-to-undefined.pipe';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';
import { ClientStakeholderService } from './clientStakeholder.service';

@Controller({
  path: 'stakeholder',
  version: '1',
})
@UseGuards(JwtAuthGuard, AccessControlGuard)
@AccessScopes('canManageStakeholders')
export class ClientStakeholderController {
  constructor(
    private readonly clientStakeholderService: ClientStakeholderService,
  ) {}

  @Post()
  @ApiMessage('Client stakeholder created successfully')
  create(
    @Req() req: RequestWithTransaction,
    @Body() dto: CreateClientStakeholderDto,
    @AuthUser() user: JwtPayload,
  ) {
    return this.clientStakeholderService.create(
      dto,
      user,
      req.transactionManager,
    );
  }

  @Put(':id')
  @ApiMessage('Client stakeholder updated successfully')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientStakeholderDto,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.clientStakeholderService.update(
      id,
      dto,
      user,
      req.transactionManager,
    );
  }

  @Delete(':id')
  @ApiMessage('Client stakeholder deleted successfully')
  softDelete(
    @Param('id') id: string,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.clientStakeholderService.softDelete(
      id,
      user,
      req.transactionManager,
    );
  }

  @Get(':id')
  @ApiMessage('Client stakeholder fetched successfully')
  getSingle(@Param('id') id: string, @Req() req: RequestWithTransaction) {
    return this.clientStakeholderService.getSingle(id, req.transactionManager);
  }

  @Get()
  @ApiMessage('Client stakeholders fetched successfully')
  getAllPaginated(
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
    @Query(new BooleanEmptyToUndefinedPipe())
    filters: {
      name?: string;
      clientId?: string;
      isDeleted?: boolean;
    },
    @Query('sortField') sortField?: keyof ClientStakeholder,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const sort =
      sortField && sortOrder
        ? { field: sortField, order: sortOrder }
        : undefined;

    return this.clientStakeholderService.getAllPaginated(
      page,
      limit,
      filters,
      sort,
      req.transactionManager,
    );
  }
}
