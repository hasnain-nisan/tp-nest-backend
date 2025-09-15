import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigController } from './config.controller';
import { Config } from 'src/entities/Config.entity';
import { ConfigRepository } from './config.repository';
import { ConfigService } from './config.service';
import { ProjectModule } from '../project/project.module';
import { AdminSettingsModule } from '../AdminSettings/admin-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Config]),
    ProjectModule,
    AdminSettingsModule,
  ],
  controllers: [ConfigController],
  providers: [ConfigRepository, ConfigService],
  exports: [ConfigRepository, ConfigService],
})
export class ProjectConfigModule {}
