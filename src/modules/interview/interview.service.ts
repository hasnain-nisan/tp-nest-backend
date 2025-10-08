import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { User } from 'src/entities/User.entity';
import { Client } from 'src/entities/Client.entity';
import { Project } from 'src/entities/Project.entity';
import { ClientRepository } from '../client/client.repository';
import { ProjectRepository } from '../project/project.repository';
import { CreateInterviewDto } from './dtos/create-interview.dto';
import { UpdateInterviewDto } from './dtos/update-interview.dto';
import { IInterviewService } from './interfaces/interview-service.interface';
import { InterviewRepository } from './interview.repository';
import { Interview } from 'src/entities/DiscoveryInterview.entity';
import { ClientStakeholderRepository } from '../clientStakeholder/clientStakeholder.repository';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';
import { AdminSettingsService } from '../AdminSettings/admin-settings.service';
import { extractDriveId } from 'src/common/utils/helper';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class InterviewService implements IInterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private readonly interviewRepo: InterviewRepository,
    private readonly clientRepo: ClientRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly stakeholderRepo: ClientStakeholderRepository,
    private readonly settingsService: AdminSettingsService,
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    dto: CreateInterviewDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Interview> {
    // console.log('Creating interview...', dto);

    const client = await this.clientRepo.findOne({
      where: { id: dto.clientId, isDeleted: false },
      relations: ['stakeholders'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${dto.clientId} not found`);
    }

    const project = await this.projectRepo.findOne({
      where: {
        id: dto.projectId,
        client: { id: dto.clientId },
        isDeleted: false,
      },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${dto.projectId} not found for client ${dto.clientId}`,
      );
    }

    const availableStakeholders = client.stakeholders || [];

    const validStakeholderIds = availableStakeholders.map((s) => s.id);
    const invalidIds = dto.stakeholderIds.filter(
      (id) => !validStakeholderIds.includes(id),
    );

    if (invalidIds.length > 0) {
      throw new NotFoundException(
        `Stakeholders not associated with client: ${invalidIds.join(', ')}`,
      );
    }

    const stakeholders = await this.stakeholderRepo.findAll(
      { where: { id: In(dto.stakeholderIds), isDeleted: false } },
      manager,
    );

    // if (dto.gDriveId) {
    //   const settings = await this.settingsService.getSingle(manager);

    //   if (!settings.clientEmail || !settings.privateKey) {
    //     throw new BadRequestException(
    //       'Missing Google credentials in Admin Settings',
    //     );
    //   }

    //   await this.settingsService.validateGDriveIdWithSdk(
    //     dto.gDriveId.trim(),
    //     settings.clientEmail,
    //     settings.privateKey,
    //   );
    // }

    // await Promise.all([
    //   this.validateDriveField(dto.gDriveId, 'gDriveId'),
    //   this.validateDriveField(dto.requestDistillation, 'requestDistillation'),
    //   this.validateDriveField(dto.requestCoaching, 'requestCoaching'),
    //   this.validateDriveField(dto.requestUserStories, 'requestUserStories'),
    // ]);

    const {
      requestDistillation,
      requestCoaching,
      requestUserStories,
      ...rest
    } = dto;

    const interview = await this.interviewRepo.create(
      {
        ...rest,
        date: new Date(dto.date),
        client: { id: dto.clientId } as Client,
        project: { id: dto.projectId } as Project,
        stakeholders,
        createdBy: { id: user.id } as User,
      },
      manager,
    );

    /* Trigger Webhook */
    await this.triggerInterviewWebhook(
      dto,
      client,
      project,
      stakeholders,
      user,
    );

    return interview;
  }

  async update(
    id: string,
    dto: UpdateInterviewDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Interview | null> {
    const existingInterview = await this.interviewRepo.findOne(
      {
        where: { id, isDeleted: false },
        relations: ['client', 'client.stakeholders'],
      },
      manager,
    );

    if (!existingInterview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    let client: Client | null | undefined;
    let clientChanged: boolean = false;
    if (dto.clientId && dto.clientId !== existingInterview.client?.id) {
      clientChanged = true;
      client = await this.clientRepo.findOne({
        where: { id: dto.clientId, isDeleted: false },
        relations: ['stakeholders'],
      });
      if (!client) {
        throw new NotFoundException(`Client with ID ${dto.clientId} not found`);
      }
    } else {
      client = existingInterview.client;
    }

    let project: Project | null | undefined;
    if (dto.projectId && dto.projectId !== existingInterview.project?.id) {
      project = await this.projectRepo.findOne({
        where: {
          id: dto.projectId,
          client: { id: dto.clientId },
          isDeleted: false,
        },
      });
      if (!project) {
        throw new NotFoundException(
          `Project with ID ${dto.projectId} not found`,
        );
      }
    }

    if (clientChanged) {
      // Enforce stakeholderIds presence when client changes
      if (!dto.stakeholderIds || dto.stakeholderIds.length === 0) {
        throw new NotFoundException(
          `Stakeholders must be provided when changing the client`,
        );
      }
    }

    // Validate stakeholder ownership
    let stakeholders: ClientStakeholder[] | undefined;
    if (dto.stakeholderIds) {
      if (dto.stakeholderIds.length === 0) {
        throw new NotFoundException(
          `At least one stakeholder must be assigned`,
        );
      }

      const availableStakeholders = client?.stakeholders || [];
      console.log(availableStakeholders, client?.id);

      const validIds = availableStakeholders.map((s) => s.id);
      const invalidIds = dto.stakeholderIds.filter(
        (id) => !validIds.includes(id),
      );

      if (invalidIds.length > 0) {
        throw new NotFoundException(
          `Stakeholders not associated with client: ${invalidIds.join(', ')}`,
        );
      }

      stakeholders = await this.stakeholderRepo.findAll(
        { where: { id: In(dto.stakeholderIds), isDeleted: false } },
        manager,
      );

      if (stakeholders.length === 0) {
        throw new NotFoundException(
          `No valid stakeholders found for the provided IDs`,
        );
      }
    }

    // if (dto.gDriveId) {
    //   const settings = await this.settingsService.getSingle(manager);

    //   if (!settings.clientEmail || !settings.privateKey) {
    //     throw new BadRequestException(
    //       'Missing Google credentials in Admin Settings',
    //     );
    //   }

    //   await this.settingsService.validateGDriveIdWithSdk(
    //     dto.gDriveId.trim(),
    //     settings.clientEmail,
    //     settings.privateKey,
    //   );
    // }

    await Promise.all([
      this.validateDriveField(dto.gDriveId, 'gDriveId'),
      // this.validateDriveField(dto.requestDistillation, 'requestDistillation'),
      // this.validateDriveField(dto.requestCoaching, 'requestCoaching'),
      // this.validateDriveField(dto.requestUserStories, 'requestUserStories'),
    ]);

    const updatePayload: Partial<Interview> = {
      ...(dto.name && { name: dto.name }),
      gDriveId: dto.gDriveId?.trim() || '',
      requestDistillation: dto.requestDistillation || false,
      requestCoaching: dto.requestCoaching || false,
      requestUserStories: dto.requestUserStories || false,
      ...(dto.date && { date: new Date(dto.date) }),
      ...(client && { client }),
      ...(project && { project }),
      ...(stakeholders && { stakeholders }),
      updatedBy: { id: user.id } as User,
    };

    return await this.interviewRepo.update(id, updatePayload, manager);
  }

  async softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean> {
    const existing = await this.interviewRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );

    if (!existing) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    await this.interviewRepo.update(
      id,
      {
        isDeleted: true,
        updatedBy: { id: user.id } as User,
      },
      manager,
    );

    return true;
  }

  async getSingle(id: string, manager?: EntityManager): Promise<Interview> {
    const existing = await this.interviewRepo.findOne(
      {
        where: { id },
        relations: [
          'client',
          'project',
          'stakeholders',
          'createdBy',
          'updatedBy',
        ],
      },
      manager,
    );

    if (!existing) throw new NotFoundException('Interview not found');
    return existing;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientId?: string;
      projectId?: string;
      stakeholderId?: string;
      isDeleted?: boolean;
      startDate?: Date;
      endDate?: Date;
    },
    sort?: { field: keyof Interview; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: Interview[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const [items, total] =
      await this.interviewRepo.findAllPaginatedWithQueryBuilder(
        page,
        limit,
        filters,
        sort,
        manager,
      );

    return {
      items,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async validateDriveField(input?: string, fieldName?: string): Promise<void> {
    const driveId = extractDriveId(input);

    if (!driveId) return;

    try {
      const settings = await this.settingsService.getSingle();

      if (!settings.clientEmail || !settings.privateKey) {
        throw new BadRequestException(
          'Missing Google credentials in Admin Settings',
        );
      }

      await this.settingsService.validateGDriveIdWithSdk(
        driveId,
        settings.clientEmail,
        settings.privateKey,
      );
    } catch (err: any) {
      this.logger.error(err);
      throw new BadRequestException(
        `Invalid Google Drive ID in ${fieldName}: ${input}`,
      );
    }
  }

  async triggerInterviewWebhook(
    dto: CreateInterviewDto,
    client: Client,
    project: Project,
    stakeholders: ClientStakeholder[],
    user: JwtPayload,
  ): Promise<void> {
    const services: string[] = [];

    if (dto.requestDistillation) {
      services.push('Distillation / Summary / Follow-up Email');
    }
    if (dto.requestCoaching) {
      services.push('Coaching / Feedback');
    }
    if (dto.requestUserStories) {
      services.push('User Stories');
    }

    if (services.length === 0) return;

    /* Jwt token creation */
    const superAdmin = await this.userRepo.findOne({
      where: { role: 'SuperAdmin' },
    });

    if (!superAdmin) {
      this.logger.warn('⚠️ No SuperAdmin found. Cannot assign createdBy.');
      return;
    }

    const authPayload = {
      email: superAdmin.email,
      sub: superAdmin.id,
      // email: user.email,
      // sub: user.id,
    };

    const access_token = this.jwtService.sign(authPayload);
    /* Jwt token creation */

    const payload = {
      answers: {
        Client: `${client.name} | ${client.clientCode}`,
        'Project Name': project.name,
        'Client Team': project.clientTeam,
        'Interview Name': dto.name,
        'Client Stakeholders': stakeholders.map((s) => s.name).join(', '),
        'Date of Interview': dto.date,
        'Google Drive Transcript ID': dto.gDriveId?.trim() || '',
        'What service(s) would you like to receive?': services,
        // 'Who should we send the output to': user.email,
        'Who should we send the output to': 'ahsan.habib@transparent.partners',
      },
      row: 5, // Replace with dynamic logic if needed
      user: user.email,
      access_token,
    };

    try {
      await fetch(
        'https://transparentpartners.app.n8n.cloud/webhook/9ff14226-c654-459f-99fc-92d9d9a706d0',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      this.logger.log('Interview webhook triggered successfully', payload);
    } catch (err) {
      this.logger.error('Failed to trigger interview webhook', err);
    }
  }
}
