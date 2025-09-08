import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
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

@Injectable()
export class InterviewService implements IInterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private readonly interviewRepo: InterviewRepository,
    private readonly clientRepo: ClientRepository,
    private readonly projectRepo: ProjectRepository,
  ) {}

  async create(
    dto: CreateInterviewDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Interview> {
    const client = await this.clientRepo.findOne({
      where: { id: dto.clientId, isDeleted: false },
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

    return await this.interviewRepo.create(
      {
        ...dto,
        date: new Date(dto.date),
        client: { id: dto.clientId } as Client,
        project: { id: dto.projectId } as Project,
        createdBy: { id: user.id } as User,
      },
      manager,
    );
  }

  async update(
    id: string,
    dto: UpdateInterviewDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Interview | null> {
    const existingInterview = await this.interviewRepo.findOne(
      { where: { id, isDeleted: false } },
      manager,
    );

    if (!existingInterview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    let client: Client | null | undefined;
    if (dto.clientId && dto.clientId !== existingInterview.client?.id) {
      client = await this.clientRepo.findOne({
        where: { id: dto.clientId, isDeleted: false },
      });
      if (!client) {
        throw new NotFoundException(`Client with ID ${dto.clientId} not found`);
      }
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

    const updatePayload: Partial<Interview> = {
      ...(dto.name && { name: dto.name }),
      ...(dto.gDriveId && { gDriveId: dto.gDriveId }),
      ...(dto.requestDistillation && {
        requestDistillation: dto.requestDistillation,
      }),
      ...(dto.requestCoaching && { requestCoaching: dto.requestCoaching }),
      ...(dto.requestUserStories && {
        requestUserStories: dto.requestUserStories,
      }),
      ...(dto.date && { date: new Date(dto.date) }),
      ...(client && { client }),
      ...(project && { project }),
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
          'project.stakeholders',
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
}
