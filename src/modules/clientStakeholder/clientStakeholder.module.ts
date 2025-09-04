import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientStakeholderController } from './clientStakeholder.controller';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';
import { ClientStakeholderRepository } from './clientStakeholder.repository';
import { ClientStakeholderService } from './clientStakeholder.service';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [TypeOrmModule.forFeature([ClientStakeholder]), ClientModule],
  controllers: [ClientStakeholderController],
  providers: [ClientStakeholderRepository, ClientStakeholderService],
  exports: [ClientStakeholderRepository, ClientStakeholderService],
})
export class ClientStakeholderModule {}
