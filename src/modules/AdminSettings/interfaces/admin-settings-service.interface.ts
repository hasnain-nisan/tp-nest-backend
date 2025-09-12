import { JwtPayload } from 'src/common/interfaces/types.interface';
import { EntityManager } from 'typeorm';
import { UpdateAdminSettingsDto } from '../dtos/update-admin-settings.dto';
import { AdminSettings } from 'src/entities/AdminSettings.entity';

export interface IAdminSettingsService {
  update(
    id: string,
    dto: UpdateAdminSettingsDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<AdminSettings | null>;

  getSingle(manager?: EntityManager): Promise<AdminSettings>;

  getAll(manager?: EntityManager): Promise<AdminSettings>;

  validateGDriveIdWithSdk(
    gDriveId: string,
    clientEmail: string,
    privateKey: string,
  ): Promise<void>;
}
