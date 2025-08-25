import { User } from 'src/entities/User.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { JwtPayload } from 'src/common/interfaces/types.interface';

export interface IUserService {
  create(dto: CreateUserDto, user: JwtPayload): Promise<User>;
}
