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
        // User Management
        canAccessUsers: true,
        canCreateUsers: Math.random() < 0.5,
        canUpdateUsers: Math.random() < 0.5,
        canDeleteUsers: Math.random() < 0.5,

        // Client Management
        canAccessClients: true,
        canCreateClients: Math.random() < 0.5,
        canUpdateClients: Math.random() < 0.5,
        canDeleteClients: Math.random() < 0.5,

        // Stakeholder Management
        canAccessStakeholders: true,
        canCreateStakeholders: Math.random() < 0.5,
        canUpdateStakeholders: Math.random() < 0.5,
        canDeleteStakeholders: Math.random() < 0.5,

        // Project Management
        canAccessProjects: true,
        canCreateProjects: Math.random() < 0.5,
        canUpdateProjects: Math.random() < 0.5,
        canDeleteProjects: Math.random() < 0.5,

        // Interview Management
        canAccessInterviews: true,
        canCreateInterviews: Math.random() < 0.5,
        canUpdateInterviews: Math.random() < 0.5,
        canDeleteInterviews: Math.random() < 0.5,

        // TPConfig Module
        canAccessConfig: true,
        canCreateConfig: Math.random() < 0.5,
        canUpdateConfig: Math.random() < 0.5,
        canDeleteConfig: Math.random() < 0.5,

        // AdminSettings Module
        canAccessAdminSettings: true,
        canUpdateAdminSettings: Math.random() < 0.5,
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
