import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AccessScopes } from 'src/common/decorators/access-scopes.decorator';
import type { JwtPayload } from 'src/common/interfaces/types.interface';
import type { RequestWithTransaction } from 'src/common/interfaces/request-with-manager.interface';

import { UpdateAdminSettingsDto } from './dtos/update-admin-settings.dto';
import { AdminSettingsService } from './admin-settings.service';

@Controller({
  path: 'admin-settings',
  version: '1',
})
@UseGuards(JwtAuthGuard, AccessControlGuard)
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Put(':id')
  @AccessScopes('canUpdateAdminSettings')
  @ApiMessage('Admin settings updated successfully')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminSettingsDto,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.adminSettingsService.update(
      id,
      dto,
      user,
      req.transactionManager,
    );
  }

  @Get()
  @AccessScopes('canAccessAdminSettings')
  @ApiMessage('Admin settings fetched successfully')
  getSingle(@Req() req: RequestWithTransaction) {
    return this.adminSettingsService.getSingle(req.transactionManager);
  }
}
