import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { AccessControlGuard } from 'src/common/guards/access-control.guard';
import { AccessScopes } from 'src/common/decorators/access-scopes.decorator';
import { BooleanEmptyToUndefinedPipe } from 'src/common/pipes/boolean-empty-to-undefined.pipe';
import type { JwtPayload } from 'src/common/interfaces/types.interface';
import type { RequestWithTransaction } from 'src/common/interfaces/request-with-manager.interface';

import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { Project } from 'src/entities/Project.entity';
import { ProjectService } from './project.service';

@Controller({
  path: 'project',
  version: '1',
})
@UseGuards(JwtAuthGuard, AccessControlGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @AccessScopes('canManageProjects')
  @ApiMessage('Project created successfully')
  create(
    @Req() req: RequestWithTransaction,
    @Body() dto: CreateProjectDto,
    @AuthUser() user: JwtPayload,
  ) {
    return this.projectService.create(dto, user, req.transactionManager);
  }

  @Put(':id')
  @AccessScopes('canManageProjects')
  @ApiMessage('Project updated successfully')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.projectService.update(id, dto, user, req.transactionManager);
  }

  @Delete(':id')
  @AccessScopes('canManageProjects')
  @ApiMessage('Project deleted successfully')
  softDelete(
    @Param('id') id: string,
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
  ) {
    return this.projectService.softDelete(id, user, req.transactionManager);
  }

  @Get(':id')
  @AccessScopes('canManageProjects')
  @ApiMessage('Project fetched successfully')
  getSingle(@Param('id') id: string, @Req() req: RequestWithTransaction) {
    return this.projectService.getSingle(id, req.transactionManager);
  }

  @Get()
  @ApiMessage('Projects fetched successfully')
  getAllPaginated(
    @AuthUser() user: JwtPayload,
    @Req() req: RequestWithTransaction,
    @Query(new BooleanEmptyToUndefinedPipe())
    filters: {
      name?: string;
      clientTeam?: string;
      clientId?: string;
      stakeholderId?: string;
      isDeleted?: boolean;
    },
    @Query('sortField') sortField?: keyof Project,
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const sort =
      sortField && sortOrder
        ? { field: sortField, order: sortOrder }
        : undefined;

    return this.projectService.getAllPaginated(
      page,
      limit,
      filters,
      sort,
      req.transactionManager,
    );
  }
}
