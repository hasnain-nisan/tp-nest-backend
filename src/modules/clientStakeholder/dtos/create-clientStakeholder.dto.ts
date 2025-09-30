import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateClientStakeholderDto {
  @IsString()
  @IsNotEmpty({ message: 'Stakeholder name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Email must not be empty if provided' })
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Phone must not be empty if provided' })
  phone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Role must not be empty if provided' })
  role?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Team must not be empty if provided' })
  team?: string;

  @IsUUID('4', { message: 'Invalid client ID format' })
  clientId: string;
}
