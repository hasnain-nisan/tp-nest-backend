import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../modules/user/user.repository';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { User } from '../entities/User.entity'; // Assuming this path is correct

@Injectable()
export class SuperAdminUserSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperAdminUserSeeder.name);
  constructor(
    private readonly userRepo: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  // Function to create the full access object
  private getFullAccessScopes(): User['accessScopes'] {
    return {
      // User Management
      canAccessUsers: true,
      canCreateUsers: true,
      canUpdateUsers: true,
      canDeleteUsers: true,

      // Client Management
      canAccessClients: true,
      canCreateClients: true,
      canUpdateClients: true,
      canDeleteClients: true,

      // Stakeholder Management
      canAccessStakeholders: true,
      canCreateStakeholders: true,
      canUpdateStakeholders: true,
      canDeleteStakeholders: true,

      // Project Management
      canAccessProjects: true,
      canCreateProjects: true,
      canUpdateProjects: true,
      canDeleteProjects: true,

      // Interview Management
      canAccessInterviews: true,
      canCreateInterviews: true,
      canUpdateInterviews: true,
      canDeleteInterviews: true,

      // TPConfig Module
      canAccessConfig: true,
      canCreateConfig: true,
      canUpdateConfig: true,
      canDeleteConfig: true,

      // AdminSettings Module
      canAccessAdminSettings: true,
      canUpdateAdminSettings: true,
    };
  }

  async onApplicationBootstrap() {
    const email = this.configService.get<string>('SUPERADMIN_EMAIL');
    const password = this.configService.get<string>('SUPERADMIN_PASSWORD');
    const fullAccessScopes = this.getFullAccessScopes();

    if (!email || !password) {
      this.logger.error(
        `Cannot seed SuperAdmin user because SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD is not set in .env file.`,
      );
      return;
    }

    const existingUser = await this.userRepo.findOne({ where: { email } });

    if (existingUser) {
      // --- UPDATE LOGIC ---
      // Update the existing user with the full access scopes
      // This ensures that any new permissions added to the schema are automatically granted.
      await this.userRepo.update(existingUser.id, {
        accessScopes: fullAccessScopes,
      });

      this.logger.log('✅ Super Admin user access scopes updated.');
    } else {
      // --- CREATE LOGIC ---
      const hashed = await bcrypt.hash(password, 10);

      await this.userRepo.create({
        email,
        password: hashed,
        role: 'SuperAdmin',
        accessScopes: fullAccessScopes, // Use the generated full access object
      });

      this.logger.log(`✅ SuperAdmin created and seeded from .env`);
    }
  }
}
