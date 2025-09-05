import { CreateProjectDto } from '../dtos/create-project.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { EntityManager } from 'typeorm';
import { Project } from 'src/entities/Project.entity';

export interface IProjectService {
  _placeholder?: unknown;

  create(
    dto: CreateProjectDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Project>;

  update(
    id: string,
    dto: UpdateProjectDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Project | null>;

  softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean>;

  getSingle(id: string, manager?: EntityManager): Promise<Project>;

  getAllPaginated(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientId?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof Project; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: Project[];
    total: number;
    currentPage: number;
    totalPages: number;
  }>;
}
