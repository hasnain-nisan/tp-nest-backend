import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ClientRepository } from 'src/modules/client/client.repository';
import { UserRepository } from 'src/modules/user/user.repository';

@Injectable()
export class ClientSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(ClientSeeder.name);

  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async onApplicationBootstrap() {
    const existing = await this.clientRepo.count();
    if (existing >= 100) {
      this.logger.log('✅ Clients already seeded');
      return;
    }

    const superAdmin = await this.userRepo.findOne({
      where: { role: 'SuperAdmin' },
    });

    if (!superAdmin) {
      this.logger.warn('⚠️ No SuperAdmin found. Cannot assign createdBy.');
      return;
    }

    for (let i = 1; i <= 100; i++) {
      const name = `Client ${i}`;
      const clientCode = `CL-${name.split(' ')[1].toUpperCase()}`;

      await this.clientRepo.create({
        name,
        clientCode,
        createdBy: superAdmin,
        updatedBy: superAdmin,
      });
    }

    this.logger.log('✅ 100 Clients seeded');
  }
}
