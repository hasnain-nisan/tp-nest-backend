import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ClientStakeholderRepository } from 'src/modules/clientStakeholder/clientStakeholder.repository';
import { ClientRepository } from 'src/modules/client/client.repository';
import { UserRepository } from 'src/modules/user/user.repository';

@Injectable()
export class ClientStakeholderSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(ClientStakeholderSeeder.name);

  constructor(
    private readonly stakeholderRepo: ClientStakeholderRepository,
    private readonly clientRepo: ClientRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async onApplicationBootstrap() {
    const existingCount = await this.stakeholderRepo.count();
    if (existingCount >= 100) {
      this.logger.log('✅ Client stakeholders already seeded');
      return;
    }

    const clients = await this.clientRepo.findAll({
      where: { isDeleted: false },
    });
    if (clients.length === 0) {
      this.logger.warn('⚠️ No clients found. Cannot seed stakeholders.');
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
      const randomClient = clients[Math.floor(Math.random() * clients.length)];

      await this.stakeholderRepo.create({
        name: `Stakeholder ${i}`,
        email: `stakeholder${i}@example.com`,
        phone: `+8801${Math.floor(100000000 + Math.random() * 899999999)}`,
        client: randomClient,
        createdBy: superAdmin,
        updatedBy: superAdmin,
      });
    }

    this.logger.log('✅ 100 Client stakeholders seeded');
  }
}
