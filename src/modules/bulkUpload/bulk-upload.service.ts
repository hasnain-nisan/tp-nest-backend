import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, FindOptionsWhere } from 'typeorm';
import type { JwtPayload } from 'src/common/interfaces/types.interface';
import * as XLSX from 'xlsx'; // 👈 Import the XLSX library
import { Client } from 'src/entities/Client.entity';
import { Project } from 'src/entities/Project.entity';
import { ClientStakeholder } from 'src/entities/ClientStakeholder.entity';
import { User } from 'src/entities/User.entity';

// --- Interfaces for Parsed Data (Assuming your Excel format) ---
interface StakeholderData {
  name: string;
  email: string;
  phone?: string; // Added phone based on ClientStakeholder entity
  team?: string;
  role?: string;
}

interface FullRecord {
  clientName: string;
  clientCode: string;
  projectName: string;
  projectDescription: string;
  stakeholders: StakeholderData[];
}

interface ProjectRecord {
  projectName: string;
  projectDescription: string;
  stakeholders: StakeholderData[];
}

interface StakeholderRecord {
  // We use this structure to match the overall flow, though each record will contain
  // data for only one physical row of stakeholder information in the spreadsheet.
  stakeholders: StakeholderData[];
}

// --- Utility Functions for XLSX Parsing ---

/**
 * Combines comma-separated lists of names, emails, teams, and roles into an array of StakeholderData objects.
 * This is used for the 'client-project-stakeholder' and 'project-stakeholder' sheets where
 * multiple stakeholders are listed in a single cell.
 */
const combineStakeholderData = (
  names: string,
  emails: string,
  teams: string,
  roles: string,
): StakeholderData[] => {
  const nameArray = (names || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s);
  const emailArray = (emails || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s);
  const teamArray = (teams || '').split(',').map((s) => s.trim());
  const roleArray = (roles || '').split(',').map((s) => s.trim());

  const maxLength = Math.max(nameArray.length, emailArray.length);
  const stakeholders: StakeholderData[] = [];

  for (let i = 0; i < maxLength; i++) {
    // An email is required to create a valid stakeholder record
    if (emailArray[i]) {
      stakeholders.push({
        name: nameArray[i] || '',
        email: emailArray[i],
        team: teamArray[i] || undefined,
        role: roleArray[i] || undefined,
        phone: undefined, // Phone column is not explicitly in the bulk samples, so it's undefined
      });
    }
  }

  return stakeholders;
};

/**
 * Implements actual CSV/Excel parsing logic using XLSX.
 * It determines which part of the spreadsheet to read based on uploadType.
 */
function parseFileToRecords(
  file: Express.Multer.File,
  uploadType: string,
): FullRecord[] | ProjectRecord[] | StakeholderRecord[] {
  try {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Parse with headers on first row
    const jsonArray: any[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
    });

    const records: any[] = [];

    for (const row of jsonArray) {
      if (uploadType === 'client-project-stakeholder') {
        if (!row['Client Name'] || !row['Client Code'] || !row['Project Name'])
          continue;

        const stakeholders = combineStakeholderData(
          row['Stakeholder Names'],
          row['Stakeholder Emails'],
          row['Stakeholder Teams'],
          row['Stakeholder Roles'],
        );

        records.push({
          clientName: row['Client Name'].toString().trim(),
          clientCode: row['Client Code'].toString().trim(),
          projectName: row['Project Name'].toString().trim(),
          projectDescription:
            row['Project Description']?.toString().trim() || '',
          stakeholders,
        } as FullRecord);
      } else if (uploadType === 'project-stakeholder') {
        if (!row['Project Name']) continue;

        const stakeholders = combineStakeholderData(
          row['Stakeholder Names'],
          row['Stakeholder Emails'],
          row['Stakeholder Teams'],
          row['Stakeholder Roles'],
        );

        records.push({
          projectName: row['Project Name'].toString().trim(),
          projectDescription:
            row['Project Description']?.toString().trim() || '',
          stakeholders,
        } as ProjectRecord);
      } else if (uploadType === 'stakeholder') {
        if (!row['Stakeholder Emails']) continue;

        records.push({
          stakeholders: [
            {
              name: row['Stakeholder Names']?.toString().trim() || '',
              email: row['Stakeholder Emails'].toString().trim(),
              team: row['Stakeholder Teams']?.toString().trim() || '',
              role: row['Stakeholder Roles']?.toString().trim() || '',
              phone: undefined,
            },
          ],
        } as StakeholderRecord);
      }
    }

    return records;
  } catch (error) {
    console.error('XLSX Parsing Error:', error);
    throw new InternalServerErrorException(
      'Failed to read or parse the uploaded file.',
    );
  }
}

// --- End of Utility Functions ---

@Injectable()
export class BulkUploadService {
  constructor(
    // ... rest of constructor remains unchanged
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ClientStakeholder)
    private stakeholderRepository: Repository<ClientStakeholder>,
    private dataSource: DataSource,
  ) {}

  /**
   * Main entry point to process the uploaded file based on type and context.
   */
  async processFile(
    // ... rest of processFile remains unchanged
    user: JwtPayload,
    file: Express.Multer.File,
    uploadType: string,
    clientId?: string,
    projectId?: string,
  ): Promise<{ message: string; processedRecords: number }> {
    const records = parseFileToRecords(file, uploadType);

    console.log(records, 'records', user);

    if (!records || records.length === 0) {
      return {
        message: 'No valid data found in the file.',
        processedRecords: 0,
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let processedCount = 0;

      switch (uploadType) {
        case 'client-project-stakeholder':
          processedCount = await this.processClientProjectStakeholder(
            queryRunner,
            records as FullRecord[],
            user,
          );
          break;

        case 'project-stakeholder':
          if (!clientId)
            throw new InternalServerErrorException(
              'Client ID is required for project-stakeholder upload.',
            );
          processedCount = await this.processProjectStakeholder(
            queryRunner,
            records as ProjectRecord[],
            user,
            clientId,
          );
          break;

        case 'stakeholder':
          if (!projectId)
            throw new InternalServerErrorException(
              'Project ID is required for stakeholder upload.',
            );
          processedCount = await this.processStakeholderOnly(
            queryRunner,
            records as StakeholderRecord[],
            user,
            projectId,
          );
          break;

        default:
          throw new InternalServerErrorException(
            `Invalid upload type: ${uploadType}`,
          );
      }

      await queryRunner.commitTransaction();
      return {
        message: 'Bulk upload completed successfully.',
        processedRecords: processedCount,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Bulk Upload Failed:', error.stack);
      throw new InternalServerErrorException(
        error.message || 'Bulk upload failed due to an internal error.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // --- Scenario 1: Client, Project, Stakeholder (Full Upload) ---

  private async processClientProjectStakeholder(
    // ... rest of processClientProjectStakeholder remains unchanged
    queryRunner: QueryRunner,
    records: FullRecord[],
    user: JwtPayload,
  ): Promise<number> {
    const createdById = user.id;

    for (const record of records) {
      // 1. Find or Create Client
      let client = await queryRunner.manager.findOne(Client, {
        where: [{ clientCode: record.clientCode }, { name: record.clientName }],
      });

      if (!client) {
        client = queryRunner.manager.create(Client, {
          name: record.clientName,
          clientCode: record.clientCode,
          createdBy: { id: createdById },
          updatedBy: { id: createdById },
        });
        client = await queryRunner.manager.save(client);
      } else if (client.isDeleted) {
        throw new InternalServerErrorException(
          `Client ${client.name} is deleted. Cannot attach new data.`,
        );
      }

      // 2. Find or Create Project (linked to the new/found Client)
      // NOTE: We load 'client' relation here to check linkage.
      let project = await queryRunner.manager.findOne(Project, {
        where: { name: record.projectName },
        relations: ['client'],
      });

      if (!project) {
        project = queryRunner.manager.create(Project, {
          name: record.projectName,
          description: record.projectDescription,
          client: client,
          createdBy: { id: createdById },
          updatedBy: { id: createdById },
        });
        project = await queryRunner.manager.save(project);
      } else if (project.client.id !== client.id) {
        // Safety check: ensure existing project is linked to the correct client
        // If not, this is a data issue, should be logged or handled.
        throw new InternalServerErrorException(
          `Project ${record.projectName} already exists and is linked to a different client.`,
        );
      } else if (project.isDeleted) {
        throw new InternalServerErrorException(
          `Project ${project.name} is deleted. Cannot attach new data.`,
        );
      }

      // 3. Find or Create Stakeholders and Link to Client
      const linkedStakeholders = await this.findOrCreateStakeholders(
        queryRunner,
        record.stakeholders,
        client.id,
        createdById,
      );

      // 4. Link Stakeholders to Project (Many-to-Many)
      await this.linkStakeholdersToProject(
        queryRunner,
        project.id,
        linkedStakeholders,
      );
    }
    return records.length;
  }

  // --- Scenario 2: Project, Stakeholder (Client ID Provided) ---

  private async processProjectStakeholder(
    // ... rest of processProjectStakeholder remains unchanged
    queryRunner: QueryRunner,
    records: ProjectRecord[],
    user: JwtPayload,
    clientId: string,
  ): Promise<number> {
    const createdById = user.id;

    // Verify Client exists
    const client = await queryRunner.manager.findOneBy(Client, {
      id: clientId,
      isDeleted: false,
    });
    if (!client) {
      throw new NotFoundException(
        `Client with ID ${clientId} not found or is deleted.`,
      );
    }

    for (const record of records) {
      // 1. Find or Create Project (linked to the provided Client)
      let project = await queryRunner.manager.findOne(Project, {
        where: { name: record.projectName },
        relations: ['client'],
      });

      if (!project) {
        project = queryRunner.manager.create(Project, {
          name: record.projectName,
          description: record.projectDescription,
          client: client,
          createdBy: { id: createdById },
          updatedBy: { id: createdById },
        });
        project = await queryRunner.manager.save(project);
      } else if (project.client.id !== client.id) {
        throw new InternalServerErrorException(
          `Project ${record.projectName} exists but belongs to a different client.`,
        );
      } else if (project.isDeleted) {
        throw new InternalServerErrorException(
          `Project ${project.name} is deleted. Cannot attach new data.`,
        );
      }

      // 2. Find or Create Stakeholders and Link to Client
      const linkedStakeholders = await this.findOrCreateStakeholders(
        queryRunner,
        record.stakeholders,
        client.id, // Link to the provided client
        createdById,
      );

      // 3. Link Stakeholders to Project
      await this.linkStakeholdersToProject(
        queryRunner,
        project.id,
        linkedStakeholders,
      );
    }
    return records.length;
  }

  // --- Scenario 3: Stakeholder Only (Project ID Provided) ---

  private async processStakeholderOnly(
    // ... rest of processStakeholderOnly remains unchanged
    queryRunner: QueryRunner,
    records: StakeholderRecord[],
    user: JwtPayload,
    projectId: string,
  ): Promise<number> {
    const createdById = user.id;

    // 1. Verify Project exists and get Client ID
    const project = await queryRunner.manager.findOne(Project, {
      where: { id: projectId, isDeleted: false },
      relations: ['client'],
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${projectId} not found or is deleted.`,
      );
    }
    const clientId = project.client.id;

    // We only expect one record containing all the stakeholders, but we loop for future flexibility
    for (const record of records) {
      // 2. Find or Create Stakeholders and Link to Project's Client
      const linkedStakeholders = await this.findOrCreateStakeholders(
        queryRunner,
        record.stakeholders,
        clientId,
        createdById,
      );

      // 3. Link Stakeholders to Project
      await this.linkStakeholdersToProject(
        queryRunner,
        project.id,
        linkedStakeholders,
      );
    }
    return records.length;
  }

  // --- Helper Methods ---

  /**
   * Finds existing Stakeholders by email/phone or creates new ones.
   * Ensures all stakeholders are linked to the provided Client ID.
   */
  private async findOrCreateStakeholders(
    // ... rest of findOrCreateStakeholders remains unchanged
    queryRunner: QueryRunner,
    stakeholderData: StakeholderData[],
    clientId: string,
    createdById: string,
  ): Promise<ClientStakeholder[]> {
    const linkedStakeholders: ClientStakeholder[] = [];

    for (const data of stakeholderData) {
      // Prioritize finding by email, then phone
      const conditions: FindOptionsWhere<ClientStakeholder>[] = [];

      // We only search for existing stakeholders if we have an email or phone number.
      if (data.email) {
        conditions.push({ email: data.email });
      }
      if (data.phone) {
        conditions.push({ phone: data.phone });
      }

      let stakeholder: ClientStakeholder | null = null;

      // Only run findOne if we have at least one valid condition (email or phone)
      if (conditions.length > 0) {
        stakeholder = await queryRunner.manager.findOne(ClientStakeholder, {
          where: conditions,
          relations: ['client'], // Load client to check linkage
        });
      }

      if (!stakeholder) {
        // Create new stakeholder
        stakeholder = queryRunner.manager.create(ClientStakeholder, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          team: data.team,
          role: data.role,
          client: { id: clientId } as Client, // Link to client
          createdBy: { id: createdById } as User,
          updatedBy: { id: createdById } as User,
        });
        stakeholder = await queryRunner.manager.save(stakeholder);
        linkedStakeholders.push(stakeholder);
      } else {
        // Stakeholder exists, verify client linkage
        if (stakeholder.isDeleted) {
          throw new InternalServerErrorException(
            `Stakeholder ${data.email || data.name} exists but is marked as deleted.`,
          );
        }
        if (stakeholder.client.id !== clientId) {
          // This stakeholder belongs to another client, which could be a business rule violation.
          throw new InternalServerErrorException(
            `Stakeholder ${data.email || data.name} belongs to a different client. Cannot link to current client/project.`,
          );
        }
        // Update non-unique fields if provided (name, role, team)
        const updatedStakeholder = queryRunner.manager.merge(
          ClientStakeholder,
          stakeholder,
          {
            name: data.name,
            team: data.team,
            role: data.role,
            updatedBy: { id: createdById } as User,
          },
        );
        stakeholder = await queryRunner.manager.save(updatedStakeholder);
        linkedStakeholders.push(stakeholder);
      }
    }
    return linkedStakeholders;
  }

  /**
   * Links a list of ClientStakeholder entities to a Project entity using
   * the ManyToMany relation.
   */
  private async linkStakeholdersToProject(
    // ... rest of linkStakeholdersToProject remains unchanged
    queryRunner: QueryRunner,
    projectId: string,
    stakeholders: ClientStakeholder[],
  ): Promise<void> {
    // 1. Get the Project entity manager to access relation helpers
    const projectManager = queryRunner.manager.getRepository(Project);

    // 2. Fetch the existing project with its current stakeholders
    const project = await projectManager.findOne({
      where: { id: projectId, isDeleted: false }, // Also check if project is not deleted
      relations: ['stakeholders'],
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${projectId} not found during stakeholder linking.`,
      );
    }

    // 3. Merge the new stakeholders with the existing ones to avoid overriding existing links
    const existingStakeholderIds = (project.stakeholders || []).map(
      (s) => s.id,
    );
    const newStakeholders = stakeholders.filter(
      (s) => !existingStakeholderIds.includes(s.id),
    );

    // 4. Update the relationship in the junction table
    // We only use .add to append new links and preserve existing ones.
    await projectManager
      .createQueryBuilder()
      .relation(Project, 'stakeholders')
      .of(project)
      .add(newStakeholders);
  }
}
