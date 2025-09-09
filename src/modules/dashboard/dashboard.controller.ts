// src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardAnalyticsDto } from './dtos/dashboard-analytics.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { endOfDay, startOfDay } from 'date-fns';

@Controller({
  path: 'dashboard',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('analytics')
  async getAnalytics(
    @Query('clientId') clientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<DashboardAnalyticsDto> {
    const fromDate = from ? startOfDay(new Date(from)) : undefined;
    const toDate = to ? endOfDay(new Date(to)) : undefined;

    return await this.dashboardService.getFlexibleAnalytics({
      clientId,
      fromDate,
      toDate,
    });
  }
}
