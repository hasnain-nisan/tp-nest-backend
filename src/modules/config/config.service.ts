import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, IsNull } from 'typeorm';
import { JwtPayload } from 'src/common/interfaces/types.interface';
import { User } from 'src/entities/User.entity';
import { CreateConfigDto } from './dtos/create-config.dto';
import { UpdateConfigDto } from './dtos/update-config.dto';
import { IConfigService } from './interfaces/config-service.interface';
import { Config } from 'src/entities/Config.entity';
import { ProjectRepository } from '../project/project.repository';
import { AdminSettingsService } from '../AdminSettings/admin-settings.service';
import { ConfigRepository } from './config.repository';
import { el, is } from 'date-fns/locale';
import { Project } from 'src/entities/Project.entity';

@Injectable()
export class ConfigService implements IConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
    private readonly configRepo: ConfigRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly settingsService: AdminSettingsService,
  ) {}

  private readonly getDefaultConfigPayload = (): Config['config'] => ({
    example1:
      'As a Sr Analyst of Marketing Activations I need an integrated data management system connecting Master Data Management, Brand Marketing, and Sales so that I can enhance operational efficiency and enable seamless cross-functional collaboration',
    example2:
      'As a Executive Creative Director I need AI-powered performance prediction and real-time content adaptation so that I can optimize creative assets dynamically and improve campaign effectiveness',
    example3:
      'As a CRM and Digital Strategy Lead I need to ensure consumer data is accurately captured, centralized, and enriched with key attributes so that activation campaigns can scale efficiently across platforms and channels',
    categories_flag: 'Y',
    us_categories: {
      MarTech:
        'User stories related to the marketing technology platforms, tools, and systems used to enable Purinas marketing capabilities',
      'Data Strategy':
        'User stories related to the collection, management, and activation of consumer data',
      Measurement:
        'User stories related to tracking, analyzing, and reporting data to assess campaign performance and effectiveness across paid, earned, shared, and owned media',
      Taxonomy:
        'User stories related data classification, structure, and naming conventions to enable cross-system and channel tracking',
      Adverity:
        'User stories related to Adverities capabilities and integrations',
      'Data Governance':
        'User stories related to the policies, procedures, and standards for managing data integrity, security, quality, and availability',
      'Ways of Working':
        'User stories related to processes, methodologies, and collaboration practices within the team or organization',
      DAM: 'User stories related to Digital Asset Management systems and processes',
      Workflow:
        'User stories related to the automation, optimization, and management of business processes and tasks using a workflow management platform',
    },
    email_confirmation: [],
    client: '',
    client_code: '',
    project_name: '',
    project_desc: '',
    custom_context: '',
    interview_tracker_gdrive_id: '',
    interview_repository_gdrive_url: '',
    global_repository_gdrive_url: '',
    output_gdrive_url: '',
    logging_output_url: '',
  });

  async create(
    dto: CreateConfigDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Config> {
    // Determine if it's a global configuration
    const isGlobal =
      !dto.projectId || dto.projectId === 'null' || dto.projectId === '';

    let project;

    if (!isGlobal) {
      // 1. Check for Project Existence
      project = await this.projectRepo.findOne({
        where: { id: dto.projectId, isDeleted: false },
        // Select only 'configs' to check for existing configuration more efficiently,
        // but 'client' is also needed for payload construction later.
        relations: ['client', 'configs'],
      });

      if (!project) {
        throw new NotFoundException(
          `Project with ID ${dto.projectId} not found`,
        );
      }
    }

    // 2. Check for Existing Configuration (Global or Project-Specific)
    let existingConfig;

    if (isGlobal) {
      // Check for existing Global Config
      existingConfig = await this.configRepo.findOne({
        where: { projectId: IsNull(), isDeleted: false },
      });
    } else {
      // Check for existing Project Config
      // If project.configs exists and has length, a config exists.
      if (project.configs?.length > 0) {
        existingConfig = project.configs[0]; // Just need to know *a* config exists
      }
    }

    if (existingConfig) {
      this.logger.log(
        'Config already exists for this project or globally',
        existingConfig,
      );
      throw new BadRequestException(
        isGlobal
          ? 'Global Config already exists. Please update it instead of creating a new one.'
          : `Project with ID ${dto.projectId} already has a config. You can update it instead of creating a new one and it will be versioned automatically.`,
      );
    }

    // 3. Google Drive Validation (only if a GDrive ID is provided)
    /* if (dto.interview_tracker_gdrive_id) {
      const settings = await this.settingsService.getSingle(manager);
      if (!settings.clientEmail || !settings.privateKey) {
        throw new BadRequestException(
          'Missing Google credentials in Admin Settings',
        );
      }

      await this.settingsService.validateGDriveIdWithSdk(
        dto.interview_tracker_gdrive_id.trim(),
        settings.clientEmail,
        settings.privateKey,
      );
    } */

    // 4. Construct Configuration Payload
    const defaults = this.getDefaultConfigPayload();

    const configPayload: Config['config'] = {
      ...defaults,
      // Safely access project and client properties only if not global
      client: isGlobal ? '' : (project?.client?.name ?? ''),
      client_code: isGlobal ? '' : (project?.client?.clientCode ?? ''),
      project_name: isGlobal ? '' : (project?.name ?? ''),
      project_desc: isGlobal ? '' : (project?.description ?? ''),
      // Use the nullish coalescing operator (??) for the DTO fields
      categories_flag: dto.categories_flag ?? defaults.categories_flag,
      example1: dto.example1 ?? defaults.example1,
      example2: dto.example2 ?? defaults.example2,
      example3: dto.example3 ?? defaults.example3,
      custom_context: dto.custom_context ?? defaults.custom_context,
      email_confirmation: dto.email_confirmation ?? defaults.email_confirmation,
      interview_tracker_gdrive_id:
        dto.interview_tracker_gdrive_id ?? defaults.interview_tracker_gdrive_id,
      interview_repository_gdrive_url:
        dto.interview_repository_gdrive_url ??
        defaults.interview_repository_gdrive_url,
      global_repository_gdrive_url:
        dto.global_repository_gdrive_url ??
        defaults.global_repository_gdrive_url,
      output_gdrive_url: dto.output_gdrive_url ?? defaults.output_gdrive_url,
      logging_output_url: dto.logging_output_url ?? defaults.logging_output_url,
      us_categories: dto.us_categories ?? defaults.us_categories,
    };

    // 5. Create Configuration Entity
    // Conditionally set the projectId. If isGlobal is true, projectId is implicitly null/undefined
    // in the database, which is handled by omitting it or passing undefined.
    // Let's create a single object for the create call to simplify.
    const configToCreate = {
      projectId: isGlobal ? undefined : dto.projectId, // Use undefined for implicit NULL
      config: configPayload,
      created_by: { id: user.id } as User,
      is_latest: true,
      version: 1,
    };

    return await this.configRepo.create(configToCreate, manager);
  }

  async update(
    id: string,
    dto: UpdateConfigDto,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<Config | null> {
    console.log('dto received in service:', dto);

    const existing = await this.configRepo.findOne(
      {
        where: { id, isDeleted: false },
        relations: ['project', 'project.client'],
      },
      manager,
    );

    if (!existing) {
      throw new NotFoundException(`Config with ID ${id} not found`);
    }
    if (existing.projectId === null) {
      throw new BadRequestException('Cannot update global config');
    }

    // --- Validate GDrive if provided ---
    // if (dto.interview_tracker_gdrive_id) {
    //   const settings = await this.settingsService.getSingle(manager);
    //   if (!settings.clientEmail || !settings.privateKey) {
    //     throw new BadRequestException(
    //       'Missing Google credentials in Admin Settings',
    //     );
    //   }

    //   await this.settingsService.validateGDriveIdWithSdk(
    //     dto.interview_tracker_gdrive_id.trim(),
    //     settings.clientEmail,
    //     settings.privateKey,
    //   );
    // }

    const isProjectChanged =
      dto.projectId && dto.projectId !== existing.projectId;

    // Mark current config as not latest
    await this.configRepo.update(id, { is_latest: false }, manager);

    let targetProject = existing.project;
    let newVersion = existing.version + 1;

    if (isProjectChanged) {
      const project = await this.projectRepo.findOne({
        where: { id: dto.projectId, isDeleted: false },
        relations: ['client', 'configs'],
      });

      if (!project) {
        throw new NotFoundException(
          `Project with ID ${dto.projectId} not found`,
        );
      }

      if (project.configs.length > 0) {
        throw new BadRequestException(
          `Project with ID ${dto.projectId} already has a config, You can update it instead of creating a new one and it will be versioned automatically`,
        );
      }

      targetProject = project;
      newVersion = 1;
    }

    // --- Build JSONB payload safely ---
    const newConfigPayload: Config['config'] = {
      ...existing.config, // preserve all existing values

      // project/client details always refreshed
      client: targetProject.client.name,
      client_code: targetProject.client.clientCode,
      project_name: targetProject.name,
      project_desc: targetProject.description,

      // selective overrides from DTO
      example1: dto.example1 ?? existing.config.example1,
      example2: dto.example2 ?? existing.config.example2,
      example3: dto.example3 ?? existing.config.example3,

      categories_flag: dto.categories_flag ?? existing.config.categories_flag,
      us_categories: dto.us_categories ?? existing.config.us_categories,
      custom_context: dto.custom_context ?? existing.config.custom_context,

      email_confirmation:
        dto.email_confirmation ?? existing.config.email_confirmation,

      interview_tracker_gdrive_id:
        dto.interview_tracker_gdrive_id ??
        existing.config.interview_tracker_gdrive_id,
      interview_repository_gdrive_url:
        dto.interview_repository_gdrive_url ??
        existing.config.interview_repository_gdrive_url,
      global_repository_gdrive_url:
        dto.global_repository_gdrive_url ??
        existing.config.global_repository_gdrive_url,
      output_gdrive_url:
        dto.output_gdrive_url ?? existing.config.output_gdrive_url,
      logging_output_url:
        dto.logging_output_url ?? existing.config.logging_output_url,
    };

    // --- Create new config version ---
    const newConfig = await this.configRepo.create(
      {
        projectId: targetProject.id,
        config: newConfigPayload,
        version: newVersion,
        is_latest: true,
        created_by: existing.created_by,
        updated_by: { id: user.id } as User,
        change_summary: dto.change_summary,
      },
      manager,
    );

    return newConfig;
  }

  async softDelete(
    id: string,
    user: JwtPayload,
    manager?: EntityManager,
  ): Promise<boolean> {
    const existing = await this.configRepo.findOne(
      { where: { id, isDeleted: false }, relations: ['project'] },
      manager,
    );

    if (!existing) {
      throw new NotFoundException(`Config with ID ${id} not found`);
    }

    // Step 1: Soft delete the current config
    await this.configRepo.update(
      id,
      {
        isDeleted: true,
        is_latest: false,
        updated_by: { id: user.id } as User,
      },
      manager,
    );

    // Step 2: If it was the latest, promote the previous version
    if (existing.is_latest) {
      const previous = await this.configRepo.findOne(
        {
          where: {
            projectId: existing.projectId,
            isDeleted: false,
            is_latest: false,
            version: existing.version - 1,
          },
        },
        manager,
      );

      if (previous) {
        await this.configRepo.update(previous.id, { is_latest: true }, manager);
      }
    }

    return true;
  }

  async getSingle(id: string, manager?: EntityManager): Promise<Config> {
    const existing = await this.configRepo.findOne(
      {
        where: { id },
        relations: ['project', 'project.client', 'created_by', 'updated_by'],
      },
      manager,
    );

    if (!existing) throw new NotFoundException('Config not found');
    return existing;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    filters: {
      projectId?: string;
      version?: number;
      is_latest?: boolean;
      created_by?: string;
    },
    sort?: { field: keyof Config; order: 'ASC' | 'DESC' },
    manager?: EntityManager,
  ): Promise<{
    items: Config[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const [items, total] =
      await this.configRepo.findAllPaginatedWithQueryBuilder(
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
