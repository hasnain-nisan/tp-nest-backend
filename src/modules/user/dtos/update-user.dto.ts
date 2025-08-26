import {
  IsOptional,
  IsString,
  IsEnum,
  IsEmail,
  Validate,
} from 'class-validator';
import { AtLeastOneScope } from './create-user.dto';
import { Match } from 'src/common/decorators/match.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @Match('password', { message: 'Confirm password must match password' })
  confirmPassword: string;

  @IsOptional()
  @IsEnum(['Admin'], {
    message: `Role must be one of the following values: Admin`,
  })
  role?: 'Admin';

  @IsOptional()
  @Validate(AtLeastOneScope)
  accessScopes?: {
    canManageUsers?: boolean;
    canManageClients?: boolean;
    canManageStakeholders?: boolean;
    canManageProjects?: boolean;
    canManageInterviews?: boolean;
  };
}
