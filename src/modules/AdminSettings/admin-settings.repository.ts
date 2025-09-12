import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { IAdminSettingsRepository } from './interfaces/admin-settings-repository.interface';
import { AdminSettings } from 'src/entities/AdminSettings.entity';

@Injectable()
export class AdminSettingsRepository implements IAdminSettingsRepository {
  constructor(
    @InjectRepository(AdminSettings)
    private readonly repo: Repository<AdminSettings>,
  ) {}

  private getManagerOrRepo(manager?: EntityManager): Repository<AdminSettings> {
    return manager ? manager.getRepository(AdminSettings) : this.repo;
  }

  async findAll(
    options?: FindManyOptions<AdminSettings>,
    manager?: EntityManager,
  ): Promise<AdminSettings[]> {
    return await this.getManagerOrRepo(manager).find({
      ...options,
    });
  }

  async create(
    data: Partial<AdminSettings>,
    manager?: EntityManager,
  ): Promise<AdminSettings> {
    const repo = this.getManagerOrRepo(manager);
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async findOne(
    options?: FindOneOptions<AdminSettings>,
    manager?: EntityManager,
  ): Promise<AdminSettings | null> {
    return await this.getManagerOrRepo(manager).findOne({ ...options });
  }

  async update(
    id: string,
    data: Partial<AdminSettings>,
    manager?: EntityManager,
  ): Promise<AdminSettings | null> {
    const repo = this.getManagerOrRepo(manager);
    const existing = await repo.findOneByOrFail({ id });

    const updated = repo.merge(existing, data);
    await repo.save(updated);

    return await this.findOne({ where: { id } }, manager);
  }

  async count(
    options?: FindManyOptions<AdminSettings>,
    manager?: EntityManager,
  ): Promise<number> {
    return await this.getManagerOrRepo(manager).count(options);
  }
}
