import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { IConfigRepository } from './interfaces/config-repository.interface';
import { Config } from 'src/entities/Config.entity';

@Injectable()
export class ConfigRepository implements IConfigRepository {
  constructor(
    @InjectRepository(Config)
    private readonly repo: Repository<Config>,
  ) {}

  private getManagerOrRepo(manager?: EntityManager): Repository<Config> {
    return manager ? manager.getRepository(Config) : this.repo;
  }

  async findAll(
    options?: FindManyOptions<Config>,
    manager?: EntityManager,
  ): Promise<Config[]> {
    return await this.getManagerOrRepo(manager).find({ ...options });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    options?: FindManyOptions<Config>,
    manager?: EntityManager,
  ): Promise<[Config[], number]> {
    return await this.getManagerOrRepo(manager).findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(
    options?: FindOneOptions<Config>,
    manager?: EntityManager,
  ): Promise<Config | null> {
    return await this.getManagerOrRepo(manager).findOne({ ...options });
  }

  async create(
    data: Partial<Config>,
    manager?: EntityManager,
  ): Promise<Config> {
    const repo = this.getManagerOrRepo(manager);
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<Config>,
    manager?: EntityManager,
  ): Promise<Config | null> {
    const repo = this.getManagerOrRepo(manager);
    const existing = await repo.findOneByOrFail({ id });

    const updated = repo.merge(existing, data);
    await repo.save(updated);

    return await this.findOne({ where: { id } }, manager);
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.getManagerOrRepo(manager).delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(
    options?: FindManyOptions<Config>,
    manager?: EntityManager,
  ): Promise<number> {
    return await this.getManagerOrRepo(manager).count(options);
  }

  async findAllPaginatedWithQueryBuilder(
    page: number,
    limit: number,
    filters: {
      projectId?: string | null;
      version?: number;
      is_latest?: boolean;
      created_by?: string;
    },
    sort?: { field: keyof Config; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<[Config[], number]> {
    const repo = this.getManagerOrRepo(manager);

    const qb = repo
      .createQueryBuilder('config')
      .leftJoinAndSelect('config.project', 'project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('config.created_by', 'created_by')
      .leftJoinAndSelect('config.updated_by', 'updated_by');

    // ✅ handle projectId filter safely
    if (filters.projectId !== undefined) {
      if (filters.projectId === null || filters.projectId === 'null') {
        qb.andWhere('config.projectId IS NULL');
      } else {
        qb.andWhere('project.id = :projectId', {
          projectId: filters.projectId,
        });
      }
    }

    if (filters.version !== undefined) {
      qb.andWhere('config.version = :version', { version: filters.version });
    }

    if (filters.is_latest !== undefined) {
      qb.andWhere('config.is_latest = :is_latest', {
        is_latest: filters.is_latest,
      });
    }

    if (filters.created_by) {
      qb.andWhere('created_by.id = :created_by', {
        created_by: filters.created_by,
      });
    }

    if (sort?.field) {
      qb.orderBy(`config.${sort.field}`, sort.order);
    } else {
      qb.orderBy('config.created_at', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    return await qb.getManyAndCount();
  }
}
