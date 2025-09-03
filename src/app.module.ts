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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SuperAdminUserSeeder,
    AdminUsersSeeder,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionInterceptor,
    },
  ],
})
export class AppModule {}
