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
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AccessScopes } from 'src/common/decorators/access-scopes.decorator';
import { BooleanEmptyToUndefinedPipe } from 'src/common/pipes/boolean-empty-to-undefined.pipe';
import type { JwtPayload } from 'src/common/interfaces/types.interface';
import type { RequestWithTransaction } from 'src/common/interfaces/request-with-manager.interface';
import { CreateConfigDto } from './dtos/create-config.dto';
import { UpdateConfigDto } from './dtos/update-config.dto';
import { Config } from 'src/entities/Config.entity';
import { ConfigService } from './config.service';

@Controller({
  path: 'config',
  version: '1',
})
@UseGuards(JwtAuthGuard, AccessControlGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  @AccessScopes('canCreateConfig')
  @ApiMessage('Project config created successfully')
  create(
    @Req() req: RequestWithTransaction,
    @Body() dto: CreateConfigDto,
    @AuthUser() user: JwtPayload,
  ) {
    return this.configService.create(dto, user, req.transactionManager);
  }

  @Put(':id')
  @AccessScopes('canUpdateConfig')
  @ApiMessage('Project config updated successfully')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateConfigDto,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.configService.update(id, dto, user, req.transactionManager);
  }

  @Delete(':id')
  @AccessScopes('canDeleteConfig')
  @ApiMessage('Project config deleted successfully')
  softDelete(
    @Param('id') id: string,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.configService.softDelete(id, user, req.transactionManager);
  }

  @Get(':id')
  @AccessScopes('canAccessConfig')
  @ApiMessage('Project config fetched successfully')
  getSingle(@Param('id') id: string, @Req() req: RequestWithTransaction) {
    return this.configService.getSingle(id, req.transactionManager);
  }

  @Get()
  @ApiMessage('Project configs fetched successfully')
  getAllPaginated(
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
    @Query(new BooleanEmptyToUndefinedPipe())
    filters: {
      projectId?: string;
      version?: number;
      is_latest?: boolean;
      created_by?: string;
    },
    @Query('sortField') sortField?: keyof Config,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const sort =
      sortField && sortOrder
        ? { field: sortField, order: sortOrder }
        : undefined;

    return this.configService.getAllPaginated(
      page,
      limit,
      filters,
      sort,
      req.transactionManager,
    );
  }
}
