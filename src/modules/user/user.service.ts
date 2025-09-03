import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/User.entity';
import { UserRepository } from './user.repository';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { IUserService } from './interfaces/user-service.interface';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import {
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Not,
  Raw,
} from 'typeorm';
import { UpdateUserDto } from './dtos/update-user.dto';
import { cleanObject } from 'src/common/utils/helper';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly userRepo: UserRepository) {}

  async create(
    dto: CreateUserDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 10);
    return await this.userRepo.create(
      {
        ...dto,
        password: hashed,
        createdBy: { id: user.id } as User,
      },
      manager,
    );
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<User | null> {
    const existingUser = await this.userRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...updateData } = dto;

    return this.userRepo.update(
      id,
      {
        ...updateData,
        updatedBy: { id: user.id } as User,
      },
      manager,
    );
  }

  async softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean> {
    const existing = await this.userRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.userRepo
      .update(
        id,
        {
          isDeleted: true,
          updatedBy: { id: user.id } as User,
        },
        manager,
      )
      .then(() => true);
  }

  async getSingle(id: string, manager?: EntityManager): Promise<User> {
    const user = await this.userRepo.findOne(
      {
        where: { id },
        relations: ['createdBy', 'updatedBy'],
      },
      manager,
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getAllPaginated(
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
    user?: JwtPayload,
  ): Promise<{
    items: User[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const accessScopeConditions: string[] = [];

    for (const key of [
      'canManageUsers',
      'canManageClients',
      'canManageStakeholders',
      'canManageProjects',
      'canManageInterviews',
    ] as const) {
      const value = filters[key];
      if (value !== undefined) {
        accessScopeConditions.push(
          `"User"."access_scopes" ->> '${key}' = '${value}'`,
        );
      }
    }

    const where: FindOptionsWhere<User> = {
      ...(filters.email && { email: ILike(`%${filters.email}%`) }),
      ...(filters.role && { role: filters.role }),
      ...(filters.isDeleted !== undefined && { isDeleted: filters.isDeleted }),
      ...(user?.id && { id: Not(user.id) }),
    };

    if (accessScopeConditions.length > 0) {
      where.accessScopes = Raw(() => accessScopeConditions.join(' AND '));
    }

    const options: FindManyOptions<User> = {
      where: cleanObject(where),
      order: sort?.field ? { [sort.field]: sort.order } : { createdAt: 'DESC' },
      relations: ['createdBy', 'updatedBy'],
    };

    const [items, total] = await this.userRepo.findAllPaginated(
      page,
      limit,
      options,
      manager,
    );

    return {
      items,
      total,
      currentPage: parseInt(page.toString(), 10),
      totalPages: Math.ceil(total / limit),
    };
  }
}
