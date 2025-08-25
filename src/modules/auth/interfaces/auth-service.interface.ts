import { User } from 'src/entities/User.entity';
import { LoginDto } from '../dto/login.dto';

export interface IAuthService {
  validateUser(email: string, password: string): Promise<User | null>;
  login(loginDto: LoginDto): Promise<{ access_token: string }>;
}
