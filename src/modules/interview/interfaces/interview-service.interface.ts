import { Interview } from 'src/entities/DiscoveryInterview.entity';
import { CreateInterviewDto } from '../dtos/create-interview.dto';
import { UpdateInterviewDto } from '../dtos/update-interview.dto';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { EntityManager } from 'typeorm';

export interface IInterviewService {
  _placeholder?: unknown;

  create(
    dto: CreateInterviewDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Interview>;

  update(
    id: string,
    dto: UpdateInterviewDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Interview | null>;

  softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean>;

  getSingle(id: string, manager?: EntityManager): Promise<Interview>;

  getAllPaginated(
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
  ): Promise<{
    items: Interview[];
    total: number;
    currentPage: number;
    totalPages: number;
  }>;
}
