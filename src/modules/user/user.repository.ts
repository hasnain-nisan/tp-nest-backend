import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { IUserRepository } from './interfaces/user-repository.interface';
import { User } from 'src/entities/User.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  private getManagerOrRepo(manager?: EntityManager): Repository<User> {
    return manager ? manager.getRepository(User) : this.repo;
  }

  async findAll(
    options?: FindManyOptions<User>,
    manager?: EntityManager,
  ): Promise<User[]> {
    return await this.getManagerOrRepo(manager).find({
      ...options,
      relations: ['members', 'whichType'],
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    options?: FindManyOptions<User>,
    manager?: EntityManager,
  ): Promise<[User[], number]> {
    return await this.getManagerOrRepo(manager).findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(
    options?: FindOneOptions<User>,
    manager?: EntityManager,
  ): Promise<User | null> {
    return await this.getManagerOrRepo(manager).findOne({
      ...options,
    });
  }

  async create(data: Partial<User>, manager?: EntityManager): Promise<User> {
    const repo = this.getManagerOrRepo(manager);
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<User>,
    manager?: EntityManager,
  ): Promise<User | null> {
    await this.getManagerOrRepo(manager).update(id, data);
    return await this.findOne({ where: { id } }, manager);
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.getManagerOrRepo(manager).delete(id);
    return (result.affected ?? 0) > 0;
  }
}
