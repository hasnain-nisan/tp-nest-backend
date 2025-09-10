import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

@ValidatorConstraint({ name: 'atLeastOneScope', async: false })
export class AtLeastOneScope implements ValidatorConstraintInterface {
  validate(accessScopes: Record<string, boolean>) {
    return accessScopes && Object.values(accessScopes).some((v) => v === true);
  }

  defaultMessage(_args: ValidationArguments) {
    return `At least one access scope must be true for ${_args.property}`;
  }
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long',
  })
  @Match('password', { message: 'Confirm password must match password' })
  confirmPassword: string;

  @IsEnum(['Admin', 'InterviewUser'], {
    message: `Role must be one of the following values: Admin`,
  })
  role: 'Admin' | 'InterviewUser';

  @Validate(AtLeastOneScope)
  accessScopes: {
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
