import { IRepository } from 'src/common/interfaces/repository.interface';
import { Config } from 'src/entities/Config.entity';
import { EntityManager } from 'typeorm';

export interface IConfigRepository extends IRepository<Config> {
  _placeholder?: unknown;

  findAllPaginatedWithQueryBuilder(
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
  ): Promise<[Config[], number]>;
}
