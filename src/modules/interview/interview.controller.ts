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

import { CreateInterviewDto } from './dtos/create-interview.dto';
import { UpdateInterviewDto } from './dtos/update-interview.dto';
import { Interview } from 'src/entities/DiscoveryInterview.entity';
import { InterviewService } from './interview.service';

@Controller({
  path: 'interview',
  version: '1',
})
@UseGuards(JwtAuthGuard, AccessControlGuard)
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post()
  @AccessScopes('canCreateInterviews')
  @ApiMessage('Interview created successfully')
  create(
    @Req() req: RequestWithTransaction,
    @Body() dto: CreateInterviewDto,
    @AuthUser() user: JwtPayload,
  ) {
    return this.interviewService.create(dto, user, req.transactionManager);
  }

  @Put(':id')
  @AccessScopes('canUpdateInterviews')
  @ApiMessage('Interview updated successfully')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.interviewService.update(id, dto, user, req.transactionManager);
  }

  @Delete(':id')
  @AccessScopes('canDeleteInterviews')
  @ApiMessage('Interview deleted successfully')
  softDelete(
    @Param('id') id: string,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.interviewService.softDelete(id, user, req.transactionManager);
  }

  @Get(':id')
  @AccessScopes('canAccessInterviews')
  @ApiMessage('Interview fetched successfully')
  getSingle(@Param('id') id: string, @Req() req: RequestWithTransaction) {
    return this.interviewService.getSingle(id, req.transactionManager);
  }

  @Get()
  @ApiMessage('Interviews fetched successfully')
  getAllPaginated(
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
    @Query(new BooleanEmptyToUndefinedPipe())
    filters: {
      name?: string;
      clientId?: string;
      projectId?: string;
      isDeleted?: boolean;
    },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortField') sortField?: keyof Interview,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const sort =
      sortField && sortOrder
        ? { field: sortField, order: sortOrder }
        : undefined;

    const dateRange =
      startDate || endDate
        ? {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
          }
        : undefined;

    return this.interviewService.getAllPaginated(
      page,
      limit,
      { ...filters, ...dateRange },
      sort,
      req.transactionManager,
    );
  }
}
