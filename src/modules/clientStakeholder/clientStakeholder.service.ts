import { User } from 'src/entities/User.entity';
import { ClientStakeholderRepository } from './clientStakeholder.repository';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateClientStakeholderDto } from './dtos/create-clientStakeholder.dto';
import { IClientStakeholderService } from './interfaces/clientStakeholder-service.interface';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { EntityManager } from 'typeorm';
import { UpdateClientStakeholderDto } from './dtos/update-clientStakeholder.dto';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';
import { ClientRepository } from '../client/client.repository';
import { Client } from 'src/entities/Client.entity';

@Injectable()
export class ClientStakeholderService implements IClientStakeholderService {
  private readonly logger = new Logger(ClientStakeholderService.name);
  constructor(
    private readonly clientStakeholderRepo: ClientStakeholderRepository,
    private readonly clientRepo: ClientRepository,
  ) {}

  async create(
    dto: CreateClientStakeholderDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<ClientStakeholder> {
    const client = await this.clientRepo.findOne({
      where: { id: dto.clientId, isDeleted: false },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${dto.clientId} not found`);
    }

    return await this.clientStakeholderRepo.create(
      {
        ...dto,
        client: { id: dto.clientId } as Client,
        createdBy: { id: user.id } as User,
      },
      manager,
    );
  }

  async update(
    id: string,
    dto: UpdateClientStakeholderDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<ClientStakeholder | null> {
    const existingStakeholder = await this.clientStakeholderRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );

    if (!existingStakeholder) {
      throw new NotFoundException(`Stakeholder with ID ${id} not found`);
    }

    return this.clientStakeholderRepo.update(
      id,
      {
        ...dto,
        updatedBy: { id: user.id } as User,
      },
      manager,
    );
  }

  async softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean> {
    const existing = await this.clientStakeholderRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );
    if (!existing) {
      throw new NotFoundException(`Stakeholder with ID ${id} not found`);
    }
    return this.clientStakeholderRepo
      .update(
        id,
        {
          isDeleted: true,
          updatedBy: { id: user.id } as User,
        },
        manager,
      )
      .then(() => true);
  }

  async getSingle(
    id: string,
    manager?: EntityManager,
  ): Promise<ClientStakeholder> {
    const existing = await this.clientStakeholderRepo.findOne(
      {
        where: { id },
        relations: ['createdBy', 'updatedBy', 'client', 'projects'],
      },
      manager,
    );
    if (!existing) throw new NotFoundException('Client not found');
    return existing;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientId?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof ClientStakeholder; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: ClientStakeholder[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const [items, total] =
      await this.clientStakeholderRepo.findAllPaginatedWithQueryBuilder(
        page,
        limit,
        filters,
        sort,
        manager,
      );

    return {
      items,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
