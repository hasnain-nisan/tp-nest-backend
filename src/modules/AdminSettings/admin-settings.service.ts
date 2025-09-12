import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { User } from 'src/entities/User.entity';
import { UpdateAdminSettingsDto } from './dtos/update-admin-settings.dto';
import { IAdminSettingsService } from './interfaces/admin-settings-service.interface';
import { AdminSettings } from 'src/entities/AdminSettings.entity';
import { AdminSettingsRepository } from './admin-settings.repository';
import { google, drive_v3 } from 'googleapis';

@Injectable()
export class AdminSettingsService implements IAdminSettingsService {
  private readonly logger = new Logger(AdminSettingsService.name);
  private driveClient: drive_v3.Drive | null = null;

  constructor(private readonly adminSettingsRepo: AdminSettingsRepository) {}

  private initializeDriveClient(
    clientEmail: string,
    privateKey: string,
  ): drive_v3.Drive {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    return google.drive({ version: 'v3', auth });
  }

  async validateGDriveIdWithSdk(
    gDriveId: string,
    clientEmail: string,
    privateKey: string,
  ): Promise<void> {
    const drive = this.initializeDriveClient(clientEmail, privateKey);

    try {
      const res = await drive.files.get({
        fileId: gDriveId.trim(),
        fields: 'id',
      });

      if (!res.data.id) {
        throw new BadRequestException('Google Drive file not found');
      }
    } catch (error) {
      this.logger.error('Google Drive validation failed', error);
      throw new BadRequestException('Invalid or inaccessible Google Drive ID');
    }
  }

  async getAll(manager?: EntityManager): Promise<AdminSettings> {
    const settings = await this.adminSettingsRepo.findAll(
      {
        relations: ['createdBy', 'updatedBy'],
      },
      manager,
    );
    return settings[0];
  }

  async update(
    id: string,
    dto: UpdateAdminSettingsDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<AdminSettings | null> {
    const existing = await this.adminSettingsRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );

    if (!existing) {
      throw new NotFoundException(`AdminSettings with ID ${id} not found`);
    }

    const updatePayload: Partial<AdminSettings> = {
      ...(dto.type && { type: dto.type }),
      ...(dto.projectId && { projectId: dto.projectId }),
      ...(dto.privateKeyId && { privateKeyId: dto.privateKeyId }),
      ...(dto.privateKey && { privateKey: dto.privateKey.trim() }),
      ...(dto.clientEmail && { clientEmail: dto.clientEmail }),
      ...(dto.clientId && { clientId: dto.clientId }),
      ...(dto.authUri && { authUri: dto.authUri }),
      ...(dto.tokenUri && { tokenUri: dto.tokenUri }),
      ...(dto.authProviderX509CertUrl && {
        authProviderX509CertUrl: dto.authProviderX509CertUrl,
      }),
      ...(dto.clientX509CertUrl && {
        clientX509CertUrl: dto.clientX509CertUrl,
      }),
      ...(dto.universeDomain && { universeDomain: dto.universeDomain }),
      // ...(dto.isDeleted !== undefined && { isDeleted: dto.isDeleted }),
      updatedBy: { id: user.id } as User,
    };

    return await this.adminSettingsRepo.update(id, updatePayload, manager);
  }

  async getSingle(manager?: EntityManager): Promise<AdminSettings> {
    const existing = await this.adminSettingsRepo.findAll(
      {
        relations: ['createdBy', 'updatedBy'],
      },
      manager,
    );

    if (existing.length === 0) {
      throw new NotFoundException(`Admin Settings not found`);
    }

    return existing[0];
  }
}
