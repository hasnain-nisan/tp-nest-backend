import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DashboardAnalyticsDto } from './dtos/dashboard-analytics.dto';
import { InterviewRepository } from '../interview/interview.repository';
import { ProjectRepository } from '../project/project.repository';
import { isAfter, isWithinInterval, subDays } from 'date-fns';
import { Interview } from 'src/entities/DiscoveryInterview.entity';
import { Project } from 'src/entities/Project.entity';
import { format } from 'date-fns/format';
import { IDashboardService } from './interfaces/dashboard-service.interface';

export type AnalyticsFilter = {
  clientId?: string;
  fromDate?: Date;
  toDate?: Date;
};

@Injectable()
export class DashboardService implements IDashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly interviewRepo: InterviewRepository,
    private readonly projectRepo: ProjectRepository,
  ) {}

  async getAnalytics(manager?: EntityManager): Promise<DashboardAnalyticsDto> {
    return this.getFlexibleAnalytics({}, manager);
  }

  async getAnalyticsByClient(
    clientId: string,
    manager?: EntityManager,
  ): Promise<DashboardAnalyticsDto> {
    return this.getFlexibleAnalytics({ clientId }, manager);
  }

  async getAnalyticsByDateRange(
    from: Date,
    to: Date,
    manager?: EntityManager,
  ): Promise<DashboardAnalyticsDto> {
    return this.getFlexibleAnalytics({ fromDate: from, toDate: to }, manager);
  }

  async getFlexibleAnalytics(
    filter: AnalyticsFilter,
    manager?: EntityManager,
  ): Promise<DashboardAnalyticsDto> {
    const { clientId, fromDate, toDate } = filter;

    const interviews = await this.interviewRepo.findAll(
      clientId
        ? {
            where: {
              client: {
                id: clientId,
              },
            },
            relations: ['project', 'client'],
          }
        : {
            relations: ['project', 'client'],
          },
      manager,
    );

    const projects = await this.projectRepo.findAll(
      clientId
        ? {
            where: {
              client: {
                id: clientId,
              },
            },
          }
        : {},
      manager,
    );

    const scopedInterviews =
      fromDate && toDate
        ? interviews.filter((i) =>
            isWithinInterval(new Date(i.date), {
              start: fromDate,
              end: toDate,
            }),
          )
        : interviews;

    return this.computeAnalytics(scopedInterviews, projects);
  }

  private computeAnalytics(
    interviews: any[],
    projects: any[],
  ): DashboardAnalyticsDto {
    const now = new Date();
    const last30Days = subDays(now, 30);
    const last90Days = subDays(now, 90);

    const totalInterviews = interviews.length;

    const completedInterviews = interviews.filter(
      (i: Interview) =>
        i.gDriveId &&
        i.requestDistillation &&
        i.requestCoaching &&
        i.requestUserStories,
    ).length;

    const activeProjects = projects.filter((p: Project) =>
      interviews.some(
        (i: Interview) =>
          i.project?.id === p.id && isAfter(new Date(i.date), last30Days),
      ),
    ).length;

    const engagedClients = new Set(
      interviews
        .filter((i: Interview) => isAfter(new Date(i.date), last90Days))
        .map((i: Interview) => i.client?.id)
        .filter(Boolean),
    ).size;

    const trendMap = new Map<string, number>();
    interviews.forEach((i: Interview) => {
      const day = format(new Date(i.date), 'yyyy-MM-dd');
      trendMap.set(day, (trendMap.get(day) || 0) + 1);
    });

    const interviewTrend = Array.from(trendMap.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));

    return {
      totalInterviews,
      completedInterviews,
      activeProjects,
      engagedClients,
      interviewTrend,
    };
  }
}
