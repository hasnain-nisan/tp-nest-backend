import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { IClientStakeholderRepository } from './interfaces/clientStakeholder-repository.interface';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';

@Injectable()
export class ClientStakeholderRepository
  implements IClientStakeholderRepository
{
  constructor(
    @InjectRepository(ClientStakeholder)
    private readonly repo: Repository<ClientStakeholder>,
  ) {}

  private getManagerOrRepo(
    manager?: EntityManager,
  ): Repository<ClientStakeholder> {
    return manager ? manager.getRepository(ClientStakeholder) : this.repo;
  }

  async findAll(
    options?: FindManyOptions<ClientStakeholder>,
    manager?: EntityManager,
  ): Promise<ClientStakeholder[]> {
    return await this.getManagerOrRepo(manager).find({
      ...options,
      // relations: ['members', 'whichType'],
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    options?: FindManyOptions<ClientStakeholder>,
    manager?: EntityManager,
  ): Promise<[ClientStakeholder[], number]> {
    return await this.getManagerOrRepo(manager).findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(
    options?: FindOneOptions<ClientStakeholder>,
    manager?: EntityManager,
  ): Promise<ClientStakeholder | null> {
    return await this.getManagerOrRepo(manager).findOne({
      ...options,
    });
  }

  async create(
    data: Partial<ClientStakeholder>,
    manager?: EntityManager,
  ): Promise<ClientStakeholder> {
    const repo = this.getManagerOrRepo(manager);
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<ClientStakeholder>,
    manager?: EntityManager,
  ): Promise<ClientStakeholder | null> {
    await this.getManagerOrRepo(manager).update(id, data);
    return await this.findOne({ where: { id } }, manager);
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.getManagerOrRepo(manager).delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(
    options?: FindManyOptions<ClientStakeholder>,
    manager?: EntityManager,
  ): Promise<number> {
    return await this.getManagerOrRepo(manager).count(options);
  }

  async findAllPaginatedWithQueryBuilder(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientId?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof ClientStakeholder; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<[ClientStakeholder[], number]> {
    const repo = this.getManagerOrRepo(manager);

    const qb = repo
      .createQueryBuilder('stakeholder')
      .leftJoinAndSelect('stakeholder.client', 'client')
      .leftJoinAndSelect('stakeholder.createdBy', 'createdBy')
      .leftJoinAndSelect('stakeholder.updatedBy', 'updatedBy')
      .leftJoinAndSelect('stakeholder.interviews', 'interviews');

    if (filters.name) {
      qb.andWhere('stakeholder.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.clientId) {
      qb.andWhere('client.id = :clientId', {
        clientId: filters.clientId,
      });
    }

    if (filters.isDeleted !== undefined) {
      qb.andWhere('stakeholder.isDeleted = :isDeleted', {
        isDeleted: filters.isDeleted,
      });
    }

    if (sort?.field) {
      qb.orderBy(`stakeholder.${sort.field}`, sort.order);
    } else {
      qb.orderBy('stakeholder.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    return await qb.getManyAndCount();
  }
}
