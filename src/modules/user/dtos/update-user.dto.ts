import {
  IsOptional,
  IsString,
  IsEnum,
  IsEmail,
  Validate,
  MinLength,
} from 'class-validator';
import { AtLeastOneScope } from './create-user.dto';
import { Match } from 'src/common/decorators/match.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long',
  })
  @Match('password', { message: 'Confirm password must match password' })
  confirmPassword: string;

  @IsOptional()
  @IsEnum(['Admin', 'InterviewUser'], {
    message: `Role must be one of the following values: Admin`,
  })
  role?: 'Admin' | 'InterviewUser';

  @IsOptional()
  @Validate(AtLeastOneScope)
  accessScopes?: {
    // User Management
    canAccessUsers?: boolean;
    canCreateUsers?: boolean;
    canUpdateUsers?: boolean;
    canDeleteUsers?: boolean;

    // Client Management
    canAccessClients?: boolean;
    canCreateClients?: boolean;
    canUpdateClients?: boolean;
    canDeleteClients?: boolean;

    // Stakeholder Management
    canAccessStakeholders?: boolean;
    canCreateStakeholders?: boolean;
    canUpdateStakeholders?: boolean;
    canDeleteStakeholders?: boolean;

    // Project Management
    canAccessProjects?: boolean;
    canCreateProjects?: boolean;
    canUpdateProjects?: boolean;
    canDeleteProjects?: boolean;

    // Interview Management
    canAccessInterviews?: boolean;
    canCreateInterviews?: boolean;
    canUpdateInterviews?: boolean;
    canDeleteInterviews?: boolean;

    // TPConfig Module
    canAccessConfig?: boolean;
    canCreateConfig?: boolean;
    canUpdateConfig?: boolean;
    canDeleteConfig?: boolean;

    // AdminSettings Module
    canAccessAdminSettings?: boolean;
    canUpdateAdminSettings?: boolean;
  };
}
