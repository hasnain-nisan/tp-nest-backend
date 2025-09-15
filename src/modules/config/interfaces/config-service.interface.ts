import { JwtPayload } from 'src/common/interfaces/types.interface';
import { EntityManager } from 'typeorm';
import { CreateConfigDto } from '../dtos/create-config.dto';
import { Config } from 'src/entities/Config.entity';
import { UpdateConfigDto } from '../dtos/update-config.dto';

export interface IConfigService {
  _placeholder?: unknown;

  create(
    dto: CreateConfigDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Config>;

  update(
    id: string,
    dto: UpdateConfigDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Config | null>;

  softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean>;

  getSingle(id: string, manager?: EntityManager): Promise<Config>;

  getAllPaginated(
    page: number,
    limit: number,
    filters: {
      projectId?: string;
      version?: number;
      is_latest?: boolean;
      created_by?: string;
    },
    sort?: { field: keyof Config; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: Config[];
    total: number;
    currentPage: number;
    totalPages: number;
  }>;
}
