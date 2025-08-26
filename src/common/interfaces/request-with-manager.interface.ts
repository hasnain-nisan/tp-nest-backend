// src/common/interfaces/request-with-manager.interface.ts
import { EntityManager } from 'typeorm';

export interface RequestWithTransaction extends Request {
  transactionManager: EntityManager;
}
