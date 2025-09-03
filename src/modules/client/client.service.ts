import { User } from 'src/entities/User.entity';
import { ClientRepository } from './client.repository';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dtos/create-client.dto';
import { IClientService } from './interfaces/client-service.interface';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import {
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
} from 'typeorm';
import { UpdateClientDto } from './dtos/update-client.dto';
import { cleanObject } from 'src/common/utils/helper';
import { Client } from 'src/entities/Client.entity';

@Injectable()
export class ClientService implements IClientService {
  private readonly logger = new Logger(ClientService.name);
  constructor(private readonly clientRepo: ClientRepository) {}

  async create(
    dto: CreateClientDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Client> {
    const formattedCode = `CL-${dto.clientCode}`.toUpperCase();
    return await this.clientRepo.create(
      {
        ...dto,
        clientCode: formattedCode,
        createdBy: { id: user.id } as User,
      },
      manager,
    );
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Client | null> {
    const existingClient = await this.clientRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );
    if (!existingClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    if (dto.clientCode) {
      dto.clientCode = `CL-${dto.clientCode}`.toUpperCase();
    }

    return this.clientRepo.update(
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
    const existing = await this.clientRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );
    if (!existing) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return this.clientRepo
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

  async getSingle(id: string, manager?: EntityManager): Promise<Client> {
    const existing = await this.clientRepo.findOne(
      {
        where: { id },
        relations: [
          'createdBy',
          'updatedBy',
          'projects',
          'interviews',
          'stakeholders',
        ],
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
      clientCode?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof Client; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: Client[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const where: FindOptionsWhere<Client> = {
      ...(filters.name && { name: ILike(`%${filters.name}%`) }),
      ...(filters.clientCode && {
        clientCode: ILike(`%${filters.clientCode}%`),
      }),
      ...(filters.isDeleted !== undefined && { isDeleted: filters.isDeleted }),
    };

    const options: FindManyOptions<Client> = {
      where: cleanObject(where),
      order: sort?.field ? { [sort.field]: sort.order } : { createdAt: 'DESC' },
      relations: [
        'createdBy',
        'updatedBy',
        'projects',
        'interviews',
        'stakeholders',
      ],
    };

    const [items, total] = await this.clientRepo.findAllPaginated(
      page,
      limit,
      options,
      manager,
    );

    return {
      items,
      total,
      currentPage: parseInt(page.toString(), 10),
      totalPages: Math.ceil(total / limit),
    };
  }
}
