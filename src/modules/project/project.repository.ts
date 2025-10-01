import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { Project } from 'src/entities/Project.entity';
import { IProjectRepository } from './interfaces/project-repository.interface';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
  ) {}

  private getManagerOrRepo(manager?: EntityManager): Repository<Project> {
    return manager ? manager.getRepository(Project) : this.repo;
  }

  async findAll(
    options?: FindManyOptions<Project>,
    manager?: EntityManager,
  ): Promise<Project[]> {
    return await this.getManagerOrRepo(manager).find({
      ...options,
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    options?: FindManyOptions<Project>,
    manager?: EntityManager,
  ): Promise<[Project[], number]> {
    return await this.getManagerOrRepo(manager).findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(
    options?: FindOneOptions<Project>,
    manager?: EntityManager,
  ): Promise<Project | null> {
    return await this.getManagerOrRepo(manager).findOne({
      ...options,
    });
  }

  async create(
    data: Partial<Project>,
    manager?: EntityManager,
  ): Promise<Project> {
    const repo = this.getManagerOrRepo(manager);
    const entity = repo.create(data);
    return await repo.save(entity);
  }

  async update(
    id: string,
    data: Partial<Project>,
    manager?: EntityManager,
  ): Promise<Project | null> {
    await this.getManagerOrRepo(manager).update(id, data);
    return await this.findOne({ where: { id } }, manager);

    // const repo = this.getManagerOrRepo(manager);
    // const existing = await repo.findOneByOrFail({ id });

    // const updated = repo.merge(existing, data);
    // await repo.save(updated);

    // return await this.findOne({ where: { id } }, manager);
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean> {
    const result = await this.getManagerOrRepo(manager).delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(
    options?: FindManyOptions<Project>,
    manager?: EntityManager,
  ): Promise<number> {
    return await this.getManagerOrRepo(manager).count(options);
  }

  async findAllPaginatedWithQueryBuilder(
    page: number,
    limit: number,
    filters: {
      name?: string;
      clientTeam?: string;
      clientId?: string;
      // stakeholderId?: string;
      isDeleted?: boolean;
    },
    sort?: { field: keyof Project; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<[Project[], number]> {
    const repo = this.getManagerOrRepo(manager);

    const qb = repo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.createdBy', 'createdBy')
      .leftJoinAndSelect('project.updatedBy', 'updatedBy')
      .leftJoinAndSelect('project.stakeholders', 'stakeholders')
      .leftJoinAndSelect('project.interviews', 'interviews');

    if (filters.name) {
      qb.andWhere('project.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.clientTeam) {
      qb.andWhere('project.clientTeam ILIKE :clientTeam', {
        clientTeam: `%${filters.clientTeam}%`,
      });
    }

    if (filters.clientId) {
      qb.andWhere('client.id = :clientId', {
        clientId: filters.clientId,
      });
    }

    // if (filters.stakeholderId) {
    //   qb.andWhere('stakeholders.id = :stakeholderId', {
    //     stakeholderId: filters.stakeholderId,
    //   });
    // }

    if (filters.isDeleted !== undefined) {
      qb.andWhere('project.isDeleted = :isDeleted', {
        isDeleted: filters.isDeleted,
      });
    }

    if (sort?.field) {
      qb.orderBy(`project.${sort.field}`, sort.order);
    } else {
      qb.orderBy('project.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    return await qb.getManyAndCount();
  }
}
