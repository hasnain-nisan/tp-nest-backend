export class DashboardAnalyticsDto {
  totalInterviews: number;
  completedInterviews: number;
  activeProjects: number;
  engagedClients: number;
  interviewTrend: { date: string; count: number }[];
}
