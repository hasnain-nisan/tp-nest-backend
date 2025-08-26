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
}
