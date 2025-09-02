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
