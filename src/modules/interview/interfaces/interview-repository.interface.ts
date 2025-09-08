import { IRepository } from 'src/common/interfaces/repository.interface';
import { Interview } from 'src/entities/DiscoveryInterview.entity';
import { EntityManager } from 'typeorm';

export interface IInterviewRepository extends IRepository<Interview> {
  _placeholder?: unknown;

  findAllPaginatedWithQueryBuilder(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientId?: string;
      projectId?: string;
      isDeleted?: boolean;
      date?: Date;
    },
    sort?: { field: keyof Interview; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<[Interview[], number]>;
}
