type BulkUploadResult =
  | { client: any; project: any; stakeholder: any }
  | { project: any; stakeholder: any }
  | { stakeholder: any };
import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ClientService } from '../client/client.service';
import { ClientStakeholderService } from '../clientStakeholder/clientStakeholder.service';
import { ProjectService } from '../project/project.service';
// import { ExcelRow } from './excel-row.interface';

@Injectable()
export class BulkUploadService {
  constructor(
    private readonly clientService: ClientService,
    private readonly projectService: ProjectService,
    private readonly stakeholderService: ClientStakeholderService,
  ) {}

  private generateClientCode(): string {
    return `CL-${Date.now()}-${Math.floor(Math.random() * 10000)}`.toUpperCase();
  }

  async processFile(
    user: import('src/common/interfaces/types.interface').JwtPayload,
    file: Express.Multer.File,
    uploadType: string,
    clientId?: string,
    projectId?: string,
  ): Promise<BulkUploadResult[]> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      {
        defval: null,
        header: [
          'clientName',
          'projectName',
          'projectDescription',
          'stakeholderName',
          'stakeholderEmail',
          'stakeholderTeam',
        ],
        range: 1,
      },
    );

    const results: BulkUploadResult[] = [];

    for (const row of rows) {
      // Basic validation for required fields
      const clientName: string | undefined =
        typeof row['clientName'] === 'string' ? row['clientName'] : undefined;
      const projectName: string | undefined =
        typeof row['projectName'] === 'string' ? row['projectName'] : undefined;
      const projectDescription: string | undefined =
        typeof row['projectDescription'] === 'string'
          ? row['projectDescription']
          : undefined;
      const stakeholderName: string | undefined =
        typeof row['stakeholderName'] === 'string'
          ? row['stakeholderName']
          : undefined;
      const stakeholderEmail: string | undefined =
        typeof row['stakeholderEmail'] === 'string'
          ? row['stakeholderEmail']
          : undefined;
      // const stakeholderTeam: string | undefined = typeof row['stakeholderTeam'] === 'string' ? row['stakeholderTeam'] : undefined;
      if (!stakeholderName || !stakeholderEmail) {
        continue; // skip invalid rows
      }
      const userContext: import('src/common/interfaces/types.interface').JwtPayload =
        user;
      if (uploadType === 'client-project-stakeholder') {
        if (!clientName || !projectName) continue;
        const client = await this.clientService.create(
          { name: clientName, clientCode: this.generateClientCode() },
          userContext,
        );
        const project = await this.projectService.create(
          {
            name: projectName,
            description: projectDescription || '',
            clientId: client.id,
          },
          userContext,
        );
        const stakeholder = await this.stakeholderService.create(
          {
            name: stakeholderName,
            email: stakeholderEmail,
            clientId: client.id,
          },
          userContext,
        );
        results.push({ client, project, stakeholder });
      }
      if (uploadType === 'project-stakeholder') {
        if (!clientId || !projectName) continue;
        const project = await this.projectService.create(
          {
            name: projectName,
            description: projectDescription || '',
            clientId: clientId,
          },
          userContext,
        );
        const stakeholder = await this.stakeholderService.create(
          {
            name: stakeholderName,
            email: stakeholderEmail,
            clientId: clientId,
          },
          userContext,
        );
        results.push({ project, stakeholder });
      }
      if (uploadType === 'stakeholder') {
        if (!projectId) continue;
        const project = await this.projectService.getSingle(projectId);
        const stakeholder = await this.stakeholderService.create(
          {
            name: stakeholderName,
            email: stakeholderEmail,
            clientId: project.client.id,
          },
          userContext,
        );
        results.push({ stakeholder });
      }
    }

    return results;
  }
}
