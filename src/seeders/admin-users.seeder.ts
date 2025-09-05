import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/modules/user/user.repository';

@Injectable()
export class AdminUsersSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminUsersSeeder.name);
  constructor(private readonly userRepo: UserRepository) {}

  async onApplicationBootstrap() {
    const existing = await this.userRepo.count();
    if (existing >= 100) {
      this.logger.log('✅ Admin users already seeded');
      return;
    }

    const superAdmin = await this.userRepo.findOne({
      where: { role: 'SuperAdmin' },
    });

    if (!superAdmin) {
      this.logger.warn('⚠️ No SuperAdmin found. Cannot assign createdBy.');
      return;
    }

    const password = await bcrypt.hash('12345678', 10);

    for (let i = 1; i <= 100; i++) {
      const email = `admin${i}@example.com`;

      const accessScopes = {
        canManageUsers: Math.random() < 0.5,
        canManageClients: Math.random() < 0.5,
        canManageStakeholders: Math.random() < 0.5,
        canManageProjects: Math.random() < 0.5,
        canManageInterviews: Math.random() < 0.5,
      };

      await this.userRepo.create({
        email,
        password,
        role: 'Admin',
        accessScopes,
        createdBy: superAdmin,
      });
    }

    this.logger.log('✅ 100 Admin users seeded');
  }
}
