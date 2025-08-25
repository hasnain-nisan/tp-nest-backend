import { User } from 'src/entities/User.entity';
import { CreateUserDto } from '../dtos/create-user.dto';

export interface IUserService {
  create(dto: CreateUserDto): Promise<User>;
}
