import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/User.entity';
import { UserRepository } from './user.repository';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { IUserService } from './interfaces/user-service.interface';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { EntityManager } from 'typeorm';
import { UpdateUserDto } from './dtos/update-user.dto';

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
    return this.userRepo.create(
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
      { where: { id } },
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
}
