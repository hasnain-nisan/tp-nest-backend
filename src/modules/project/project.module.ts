import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller';
import { Project } from 'src/entities/Project.entity';
import { ProjectRepository } from './project.repository';
import { ProjectService } from './project.service';
import { ClientModule } from '../client/client.module';
import { ClientStakeholderModule } from '../clientStakeholder/clientStakeholder.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    ClientModule,
    ClientStakeholderModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectRepository, ProjectService],
  exports: [ProjectRepository, ProjectService],
})
export class ProjectModule {}
