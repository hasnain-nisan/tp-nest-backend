import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AdminSettings } from 'src/entities/AdminSettings.entity';
import { AdminSettingsRepository } from 'src/modules/AdminSettings/admin-settings.repository';
import { UserRepository } from 'src/modules/user/user.repository';

@Injectable()
export class AdminSettingsSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSettingsSeeder.name);

  constructor(
    private readonly adminSettingsRepo: AdminSettingsRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async onApplicationBootstrap() {
    const existing = await this.adminSettingsRepo.count();
    if (existing > 0) {
      this.logger.log('✅ AdminSettings already seeded');
      return;
    }

    const superAdmin = await this.userRepo.findOne({
      where: { role: 'SuperAdmin' },
    });

    if (!superAdmin) {
      this.logger.warn('⚠️ No SuperAdmin found. Cannot assign createdBy.');
      return;
    }

    const placeholder: Partial<AdminSettings> = {
      type: 'service_account',
      privateKey:
        '-----BEGIN PRIVATE KEY-----\nPLACEHOLDER\n-----END PRIVATE KEY-----',
      clientEmail: 'placeholder@example.com',
      createdBy: superAdmin,
    };

    await this.adminSettingsRepo.create(placeholder);

    this.logger.log('✅ AdminSettings seeded with required placeholders');
  }
}
