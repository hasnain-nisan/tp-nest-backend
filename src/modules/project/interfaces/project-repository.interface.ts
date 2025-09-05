import { IRepository } from 'src/common/interfaces/repository.interface';
import { Project } from 'src/entities/Project.entity';
import { EntityManager } from 'typeorm';

export interface IProjectRepository extends IRepository<Project> {
  _placeholder?: unknown;
  findAllPaginatedWithQueryBuilder(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientId?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof Project; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<[Project[], number]>;
}
