import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewController } from './interview.controller';
import { ClientModule } from '../client/client.module';
import { ClientStakeholderModule } from '../clientStakeholder/clientStakeholder.module';
import { Interview } from 'src/entities/DiscoveryInterview.entity';
import { InterviewRepository } from './interview.repository';
import { InterviewService } from './interview.service';
import { ProjectModule } from '../project/project.module';
import { AdminSettingsModule } from '../AdminSettings/admin-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview]),
    ClientModule,
    ClientStakeholderModule,
    ProjectModule,
    AdminSettingsModule,
  ],
  controllers: [InterviewController],
  providers: [InterviewRepository, InterviewService],
  exports: [InterviewRepository, InterviewService],
})
export class InterviewModule {}
