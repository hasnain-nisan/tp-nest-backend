import { IRepository } from 'src/common/interfaces/repository.interface';
import { User } from 'src/entities/User.entity';

export interface IUserRepository extends IRepository<User> {
  _placeholder?: unknown;
}
