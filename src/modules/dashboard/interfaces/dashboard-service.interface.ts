import { EntityManager } from 'typeorm';
import { AnalyticsFilter } from '../dashboard.service';
import { DashboardAnalyticsDto } from '../dtos/dashboard-analytics.dto';

export interface IDashboardService {
  getFlexibleAnalytics(
    filter?: AnalyticsFilter,
    manager?: EntityManager,
  ): Promise<DashboardAnalyticsDto>;
}
