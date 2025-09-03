import { CreateClientDto } from '../dtos/create-client.dto';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { EntityManager } from 'typeorm';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { Client } from 'src/entities/Client.entity';

export interface IClientService {
  _placeholder?: unknown;
  create(
    dto: CreateClientDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Client>;
  update(
    id: string,
    dto: UpdateClientDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Client | null>;
  softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean>;
  getSingle(id: string, manager?: EntityManager): Promise<Client>;
  getAllPaginated(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientCode?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof Client; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: Client[];
    total: number;
    currentPage: number;
    totalPages: number;
  }>;
}
