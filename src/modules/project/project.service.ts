import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { User } from 'src/entities/User.entity';
import { Project } from 'src/entities/Project.entity';
import { Client } from 'src/entities/Client.entity';
import { ClientRepository } from '../client/client.repository';
import { ProjectRepository } from './project.repository';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { IProjectService } from './interfaces/project-service.interface';
import { ClientStakeholderRepository } from '../clientStakeholder/clientStakeholder.repository';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';

@Injectable()
export class ProjectService implements IProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly clientRepo: ClientRepository,
    private readonly stakeholderRepo: ClientStakeholderRepository,
  ) {}

  async create(
    dto: CreateProjectDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Project> {
    const client = await this.clientRepo.findOne({
      where: { id: dto.clientId, isDeleted: false },
      relations: ['stakeholders'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${dto.clientId} not found`);
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

    return await this.projectRepo.create(
      {
        ...dto,
        client: { id: dto.clientId } as Client,
        stakeholders,
        createdBy: { id: user.id } as User,
      },
      manager,
    );
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Project | null> {
    const existingProject = await this.projectRepo.findOne(
      {
        where: { id, isDeleted: false },
        relations: ['client', 'client.stakeholders'],
      },
      manager,
    );

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Determine client context
    let client: Client | null;
    const clientChanged =
      dto.clientId && dto.clientId !== existingProject.client.id;

    if (clientChanged) {
      client = await this.clientRepo.findOne({
        where: { id: dto.clientId, isDeleted: false },
        relations: ['stakeholders'],
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${dto.clientId} not found`);
      }

      // Enforce stakeholderIds presence when client changes
      if (!dto.stakeholderIds || dto.stakeholderIds.length === 0) {
        throw new NotFoundException(
          `Stakeholders must be provided when changing the client`,
        );
      }
    } else {
      client = existingProject.client;
    }

    // Validate stakeholder ownership
    let stakeholders: ClientStakeholder[] | undefined;
    if (dto.stakeholderIds) {
      if (dto.stakeholderIds.length === 0) {
        throw new NotFoundException(
          `At least one stakeholder must be assigned`,
        );
      }

      const availableStakeholders = client.stakeholders || [];
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

    return this.projectRepo.update(
      id,
      {
        ...dto,
        ...(stakeholders && { stakeholders }),
        ...(dto.clientId && { client: { id: dto.clientId } as Client }),
        updatedBy: { id: user.id } as User,
      },
      manager,
    );
  }

  async softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean> {
    const existing = await this.projectRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );

    if (!existing) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    await this.projectRepo.update(
      id,
      {
        isDeleted: true,
        updatedBy: { id: user.id } as User,
      },
      manager,
    );

    return true;
  }

  async getSingle(id: string, manager?: EntityManager): Promise<Project> {
    const existing = await this.projectRepo.findOne(
      {
        where: { id },
        relations: [
          'client',
          'createdBy',
          'updatedBy',
          'stakeholders',
          'interviews',
        ],
      },
      manager,
    );

    if (!existing) throw new NotFoundException('Project not found');
    return existing;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientTeam?: string;
      clientId?: string;
      stakeholderId?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof Project; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: Project[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const [items, total] =
      await this.projectRepo.findAllPaginatedWithQueryBuilder(
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
}
