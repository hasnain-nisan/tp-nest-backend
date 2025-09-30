import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ClientModule } from '../client/client.module';
import { ClientStakeholderModule } from '../clientStakeholder/clientStakeholder.module';
import { ProjectModule } from '../project/project.module';
import { BulkUploadController } from './bulk-upload.controller';
import { BulkUploadService } from './bulk-upload.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ClientModule,
    ProjectModule,
    ClientStakeholderModule,
  ],
  controllers: [BulkUploadController],
  providers: [
    BulkUploadService,
    // ClientService,
    // ProjectService,
    // ClientStakeholderService,
    // ClientRepository,
    // ProjectRepository,
    // ClientStakeholderRepository,
  ],
})
export class BulkUploadModule {}
