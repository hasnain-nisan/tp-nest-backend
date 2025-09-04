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
import { ClientService } from './client.service';
import { CreateClientDto } from './dtos/create-client.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import type { JwtPayload } from 'src/common/interfaces/types.interface';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AccessScopes } from 'src/common/decorators/access-scopes.decorator';
import type { RequestWithTransaction } from 'src/common/interfaces/request-with-manager.interface';
import { UpdateClientDto } from './dtos/update-client.dto';
import { BooleanEmptyToUndefinedPipe } from 'src/common/pipes/boolean-empty-to-undefined.pipe';
import { Client } from 'src/entities/Client.entity';

@Controller({
  path: 'client',
  version: '1',
})
@UseGuards(JwtAuthGuard, AccessControlGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @AccessScopes('canManageClients')
  @ApiMessage('Client created successfully')
  create(
    @Req() req: RequestWithTransaction,
    @Body() dto: CreateClientDto,
    @AuthUser() user: JwtPayload,
  ) {
    return this.clientService.create(dto, user, req.transactionManager);
  }

  @Put(':id')
  @AccessScopes('canManageClients')
  @ApiMessage('Client updated successfully')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.clientService.update(id, dto, user, req.transactionManager);
  }

  @Delete(':id')
  @AccessScopes('canManageClients')
  @ApiMessage('Client deleted successfully')
  softDelete(
    @Param('id') id: string,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.clientService.softDelete(id, user, req.transactionManager);
  }

  @Get(':id')
  @AccessScopes('canManageClients')
  @ApiMessage('Client fetched successfully')
  getSingle(@Param('id') id: string, @Req() req: RequestWithTransaction) {
    return this.clientService.getSingle(id, req.transactionManager);
  }

  @Get()
  @ApiMessage('Clients fetched successfully')
  getAllPaginated(
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
    @Query(new BooleanEmptyToUndefinedPipe())
    filters: {
      name?: string;
      clientCode?: string;
      isDeleted?: boolean;
    },
    @Query('sortField') sortField?: keyof Client,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const sort =
      sortField && sortOrder
        ? { field: sortField, order: sortOrder }
        : undefined;

    return this.clientService.getAllPaginated(
      page,
      limit,
      filters,
      sort,
      req.transactionManager,
    );
  }
}
