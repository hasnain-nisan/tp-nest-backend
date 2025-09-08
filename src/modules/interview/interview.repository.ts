import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { IInterviewRepository } from './interfaces/interview-repository.interface';
import { Interview } from 'src/entities/DiscoveryInterview.entity';

@Injectable()
export class InterviewRepository implements IInterviewRepository {
  constructor(
    @InjectRepository(Interview)
    private readonly repo: Repository<Interview>,
  ) {}

  private getManagerOrRepo(manager?: EntityManager): Repository<Interview> {
    return manager ? manager.getRepository(Interview) : this.repo;
  }

  async findAll(
    options?: FindManyOptions<Interview>,
    manager?: EntityManager,
  ): Promise<Interview[]> {
    return await this.getManagerOrRepo(manager).find({ ...options });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    options?: FindManyOptions<Interview>,
    manager?: EntityManager,
  ): Promise<[Interview[], number]> {
    return await this.getManagerOrRepo(manager).findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(
    options?: FindOneOptions<Interview>,
    manager?: EntityManager,
  ): Promise<Interview | null> {
    return await this.getManagerOrRepo(manager).findOne({ ...options });
  }

  async create(
    data: Partial<Interview>,
    manager?: EntityManager,
  ): Promise<Interview> {
    const repo = this.getManagerOrRepo(manager);
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<Interview>,
    manager?: EntityManager,
  ): Promise<Interview | null> {
    await this.getManagerOrRepo(manager).update(id, data);
    return await this.findOne({ where: { id } }, manager);
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.getManagerOrRepo(manager).delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(
    options?: FindManyOptions<Interview>,
    manager?: EntityManager,
  ): Promise<number> {
    return await this.getManagerOrRepo(manager).count(options);
  }

  async findAllPaginatedWithQueryBuilder(
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
  ): Promise<[Interview[], number]> {
    const repo = this.getManagerOrRepo(manager);

    const qb = repo
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.client', 'client')
      .leftJoinAndSelect('interview.project', 'project')
      .leftJoinAndSelect('project.stakeholders', 'projectStakeholders')
      .leftJoinAndSelect('interview.createdBy', 'createdBy')
      .leftJoinAndSelect('interview.updatedBy', 'updatedBy');

    if (filters.name) {
      qb.andWhere('interview.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.clientId) {
      qb.andWhere('client.id = :clientId', {
        clientId: filters.clientId,
      });
    }

    if (filters.projectId) {
      qb.andWhere('project.id = :projectId', {
        projectId: filters.projectId,
      });
    }

    if (filters.startDate) {
      qb.andWhere('interview.date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      qb.andWhere('interview.date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.isDeleted !== undefined) {
      qb.andWhere('interview.isDeleted = :isDeleted', {
        isDeleted: filters.isDeleted,
      });
    }

    if (sort?.field) {
      qb.orderBy(`interview.${sort.field}`, sort.order);
    } else {
      qb.orderBy('interview.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    return await qb.getManyAndCount();
  }
}
