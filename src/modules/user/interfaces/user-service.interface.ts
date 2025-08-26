import { User } from 'src/entities/User.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { EntityManager } from 'typeorm';
import { UpdateUserDto } from '../dtos/update-user.dto';

export interface IUserService {
  create(
    dto: CreateUserDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<User>;
  update(
    id: string,
    dto: UpdateUserDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<User | null>;
  softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean>;
  getSingle(id: string, manager?: EntityManager): Promise<User>;
  getAllPaginated(
    page: number,
    limit: number,
    filters: {
      email?: string;
      role?: 'SuperAdmin' | 'Admin';
      isDeleted?: boolean;
      canManageUsers?: boolean;
      canManageClients?: boolean;
      canManageStakeholders?: boolean;
      canManageProjects?: boolean;
      canManageInterviews?: boolean;
    },
    sort?: { field: keyof User; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: User[];
    total: number;
    currentPage: number;
    totalPages: number;
  }>;
}
