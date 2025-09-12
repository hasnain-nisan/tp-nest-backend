import { AdminSettings } from 'src/entities/AdminSettings.entity';
import { EntityManager, FindManyOptions, FindOneOptions } from 'typeorm';

export interface IAdminSettingsRepository {
  findAll(
    options?: FindManyOptions<AdminSettings>,
    manager?: EntityManager,
  ): Promise<AdminSettings[]>;

  create(
    entity: Partial<AdminSettings>,
    manager?: EntityManager,
  ): Promise<AdminSettings>;

  findOne(
    options?: FindOneOptions<AdminSettings>,
    manager?: EntityManager,
  ): Promise<AdminSettings | null>;

  update(
    id: string,
    entity: Partial<AdminSettings>,
    manager?: EntityManager,
  ): Promise<AdminSettings | null>;

  count(
    options?: FindManyOptions<AdminSettings>,
    manager?: EntityManager,
  ): Promise<number>;
}
