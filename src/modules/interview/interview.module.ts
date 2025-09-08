import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewController } from './interview.controller';
import { ClientModule } from '../client/client.module';
import { ClientStakeholderModule } from '../clientStakeholder/clientStakeholder.module';
import { Interview } from 'src/entities/DiscoveryInterview.entity';
import { InterviewRepository } from './interview.repository';
import { InterviewService } from './interview.service';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview]),
    ClientModule,
    ClientStakeholderModule,
    ProjectModule,
  ],
  controllers: [InterviewController],
  providers: [InterviewRepository, InterviewService],
  exports: [InterviewRepository, InterviewService],
})
export class InterviewModule {}
