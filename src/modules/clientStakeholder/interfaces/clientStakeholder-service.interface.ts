import { CreateClientStakeholderDto } from '../dtos/create-clientStakeholder.dto';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { EntityManager } from 'typeorm';
import { UpdateClientStakeholderDto } from '../dtos/update-clientStakeholder.dto';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';

export interface IClientStakeholderService {
  _placeholder?: unknown;
  create(
    dto: CreateClientStakeholderDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<ClientStakeholder>;
  update(
    id: string,
    dto: UpdateClientStakeholderDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<ClientStakeholder | null>;
  softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean>;
  getSingle(id: string, manager?: EntityManager): Promise<ClientStakeholder>;
  getAllPaginated(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientCode?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof ClientStakeholder; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: ClientStakeholder[];
    total: number;
    currentPage: number;
    totalPages: number;
  }>;
}
