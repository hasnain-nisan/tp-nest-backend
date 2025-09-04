import { IRepository } from 'src/common/interfaces/repository.interface';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';
import { EntityManager } from 'typeorm';

export interface IClientStakeholderRepository
  extends IRepository<ClientStakeholder> {
  _placeholder?: unknown;
  findAllPaginatedWithQueryBuilder(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientId?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof ClientStakeholder; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<[ClientStakeholder[], number]>;
}
