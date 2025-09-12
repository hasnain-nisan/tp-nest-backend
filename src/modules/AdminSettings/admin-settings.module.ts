import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminSettingsRepository } from './admin-settings.repository';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettings } from 'src/entities/AdminSettings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminSettings])],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsRepository, AdminSettingsService],
  exports: [AdminSettingsRepository, AdminSettingsService],
})
export class AdminSettingsModule {}
