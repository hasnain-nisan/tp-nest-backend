import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/User.entity';
import { UserRepository } from './user.repository';
import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { IUserService } from './interfaces/user-service.interface';
import { JwtPayload } from 'src/common/interfaces/types.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly userRepo: UserRepository) {}

  async create(dto: CreateUserDto, user: JwtPayload): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const userCreated = this.userRepo.create({
      ...dto,
      password: hashed,
      createdBy: { id: user.id } as User,
    });
    return userCreated;
  }
}
