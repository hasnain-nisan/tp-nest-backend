import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/typeorm.config';
import { UserModule } from './modules/user/user.module';
import { SuperAdminUserSeeder } from './seeders/superadmin-user.seeder';
import { AuthModule } from './modules/auth/auth.module';
import { AdminUsersSeeder } from './seeders/admin-users.seeder';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransactionInterceptor } from './common/interceptors/transaction.interceptor';
import { ClientModule } from './modules/client/client.module';
import { ClientSeeder } from './seeders/client.seeder';
import { ClientStakeholderModule } from './modules/clientStakeholder/clientStakeholder.module';
import { ClientStakeholderSeeder } from './seeders/stakeholder.seeder';
import { ProjectModule } from './modules/project/project.module';
import { ProjectSeeder } from './seeders/project.seeder';
import { InterviewModule } from './modules/interview/interview.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminSettingsModule } from './modules/AdminSettings/admin-settings.module';
import { AdminSettingsSeeder } from './seeders/admin-settings.seeder';
import { ProjectConfigModule } from './modules/config/config.module';
import { BulkUploadModule } from './modules/bulkUpload/bulk-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    AuthModule,
    UserModule,
    ClientModule,
    ClientStakeholderModule,
    ProjectModule,
    InterviewModule,
    DashboardModule,
    AdminSettingsModule,
    ProjectConfigModule,
    BulkUploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // SuperAdminUserSeeder,
    // AdminUsersSeeder,
    // ClientSeeder,
    // ClientStakeholderSeeder,
    // ProjectSeeder,
    // AdminSettingsSeeder,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionInterceptor,
    },
  ],
})
export class AppModule {}
