import {
  IsEmail,
  IsEnum,
  IsString,
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
  password: string;

  @IsString()
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
