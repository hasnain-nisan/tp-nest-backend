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

  @IsEnum(['Admin'], {
    message: `Role must be one of the following values: Admin`,
  })
  role: 'Admin';

  @Validate(AtLeastOneScope)
  accessScopes: {
    canManageUsers?: boolean;
    canManageClients?: boolean;
    canManageStakeholders?: boolean;
    canManageProjects?: boolean;
    canManageInterviews?: boolean;
  };
}
