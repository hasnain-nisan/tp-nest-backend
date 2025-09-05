import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Project name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Client team must not be empty if provided' })
  clientTeam?: string;

  @IsUUID('4', { message: 'Invalid client ID format' })
  clientId: string;

  @IsArray({ message: 'Stakeholders must be an array of UUIDs' })
  @ArrayMinSize(1, { message: 'At least one stakeholder must be assigned' })
  @IsUUID('4', {
    each: true,
    message: 'Each stakeholder ID must be a valid UUID',
  })
  stakeholderIds: string[];
}
