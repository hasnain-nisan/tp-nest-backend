import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { IClientRepository } from './interfaces/client-repository.interface';
import { Client } from 'src/entities/Client.entity';

@Injectable()
export class ClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  private getManagerOrRepo(manager?: EntityManager): Repository<Client> {
    return manager ? manager.getRepository(Client) : this.repo;
  }

  async findAll(
    options?: FindManyOptions<Client>,
    manager?: EntityManager,
  ): Promise<Client[]> {
    return await this.getManagerOrRepo(manager).find({
      ...options,
      // relations: ['members', 'whichType'],
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    options?: FindManyOptions<Client>,
    manager?: EntityManager,
  ): Promise<[Client[], number]> {
    return await this.getManagerOrRepo(manager).findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(
    options?: FindOneOptions<Client>,
    manager?: EntityManager,
  ): Promise<Client | null> {
    return await this.getManagerOrRepo(manager).findOne({
      ...options,
    });
  }

  async create(
    data: Partial<Client>,
    manager?: EntityManager,
  ): Promise<Client> {
    const repo = this.getManagerOrRepo(manager);
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<Client>,
    manager?: EntityManager,
  ): Promise<Client | null> {
    await this.getManagerOrRepo(manager).update(id, data);
    return await this.findOne({ where: { id } }, manager);
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.getManagerOrRepo(manager).delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(
    options?: FindManyOptions<Client>,
    manager?: EntityManager,
  ): Promise<number> {
    return await this.getManagerOrRepo(manager).count(options);
  }
}
