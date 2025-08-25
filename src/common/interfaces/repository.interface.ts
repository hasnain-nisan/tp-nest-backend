import { EntityManager, FindManyOptions, FindOneOptions } from 'typeorm';

export interface IRepository<T> {
  findAll(options?: FindManyOptions<T>, manager?: EntityManager): Promise<T[]>;
  findAllPaginated(
    page: number,
    limit: number,
    options?: FindManyOptions<T>,
    manager?: EntityManager,
  ): Promise<[T[], number]>;
  findOne(
    options?: FindOneOptions<T>,
    manager?: EntityManager,
  ): Promise<T | null>;
  create(entity: Partial<T>, manager?: EntityManager): Promise<T>;
  update(
    id: string | number,
    entity: Partial<T>,
    manager?: EntityManager,
  ): Promise<T | null>;
  delete(id: string, manager?: EntityManager): Promise<boolean>;
}
