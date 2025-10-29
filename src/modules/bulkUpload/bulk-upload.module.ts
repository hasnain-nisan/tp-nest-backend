import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BulkUploadController } from './bulk-upload.controller';
import { BulkUploadService } from './bulk-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'src/entities/Client.entity';
import { Project } from 'src/entities/Project.entity';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    TypeOrmModule.forFeature([Client, Project, ClientStakeholder]),
  ],
  controllers: [BulkUploadController],
  providers: [BulkUploadService],
})
export class BulkUploadModule {}
