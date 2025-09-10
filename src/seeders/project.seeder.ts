import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ProjectRepository } from 'src/modules/project/project.repository';
import { ClientRepository } from 'src/modules/client/client.repository';
import { UserRepository } from 'src/modules/user/user.repository';
import { ClientStakeholderRepository } from 'src/modules/clientStakeholder/clientStakeholder.repository';
import { Client } from 'src/entities/Client.entity';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';

@Injectable()
export class ProjectSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(ProjectSeeder.name);

  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly clientRepo: ClientRepository,
    private readonly stakeholderRepo: ClientStakeholderRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async onApplicationBootstrap() {
    const existingCount = await this.projectRepo.count();
    if (existingCount >= 100) {
      this.logger.log('✅ Projects already seeded');
      return;
    }

    const clients = await this.clientRepo.findAll({
      where: { isDeleted: false },
      relations: ['stakeholders'],
    });

    const eligibleClients = clients.filter(
      (c) => c.stakeholders && c.stakeholders.length > 0,
    );
    if (eligibleClients.length === 0) {
      this.logger.warn(
        '⚠️ No eligible clients with stakeholders found. Cannot seed projects.',
      );
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
      const randomClient: Client =
        eligibleClients[Math.floor(Math.random() * eligibleClients.length)];
      // const clientStakeholders: ClientStakeholder[] = randomClient.stakeholders;

      // Ensure at least 1 and at most 3 stakeholders
      // const shuffled = clientStakeholders.sort(() => 0.5 - Math.random());
      // const selectedStakeholders = shuffled.slice(
      //   0,
      //   Math.min(3, clientStakeholders.length),
      // );

      await this.projectRepo.create({
        name: `Project ${i}`,
        clientTeam: `Team ${i}`,
        client: randomClient,
        // stakeholders: selectedStakeholders,
        createdBy: superAdmin,
        updatedBy: superAdmin,
      });
    }

    this.logger.log(
      '✅ 100 Projects seeded with eligible clients and stakeholders',
    );
  }
}
