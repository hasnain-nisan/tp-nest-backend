import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/User.entity';
import { UserRepository } from './user.repository';
import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { IUserService } from './interfaces/user-service.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly userRepo: UserRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashed });
    return user;
  }
}
