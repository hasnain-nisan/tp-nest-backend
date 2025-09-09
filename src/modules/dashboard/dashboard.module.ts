import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { InterviewModule } from '../interview/interview.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [InterviewModule, ProjectModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
