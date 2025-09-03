import { IRepository } from 'src/common/interfaces/repository.interface';
import { Client } from 'src/entities/Client.entity';

export interface IClientRepository extends IRepository<Client> {
  _placeholder?: unknown;
}
