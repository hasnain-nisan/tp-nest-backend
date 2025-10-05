import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  // IsArray,
} from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Project name must not be empty if provided' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Client team must not be empty if provided' })
  clientTeam?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid client ID format' })
  clientId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Project description must not be empty if provided' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'Stakeholders must be an array of UUIDs' })
  @IsUUID('4', {
    each: true,
    message: 'Each stakeholder ID must be a valid UUID',
  })
  stakeholderIds?: string[];
}
