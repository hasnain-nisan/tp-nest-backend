import { Injectable, Logger } from '@nestjs/common';
import { IUserService } from './interfaces/user-service.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  constructor() {}

  _placeholder?: unknown;
}
