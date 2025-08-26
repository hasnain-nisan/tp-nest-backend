import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../modules/user/user.repository';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class SuperAdminUserSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperAdminUserSeeder.name);
  constructor(
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.configService.get<string>('SUPERADMIN_EMAIL');
    const password = this.configService.get<string>('SUPERADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.error(
        `Cannot seed SuperAdmin user because SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD is not set in .env file.`,
      );
      return;
    }

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) {
      this.logger.log('✅ Super Admin user already seeded');
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    await this.userRepo.create({
      email,
      password: hashed,
      role: 'SuperAdmin',
      accessScopes: {
        canManageUsers: true,
        canManageClients: true,
        canManageStakeholders: true,
        canManageProjects: true,
        canManageInterviews: true,
      },
    });
    this.logger.log(`✅ SuperAdmin seeded from .env`);
  }
}
