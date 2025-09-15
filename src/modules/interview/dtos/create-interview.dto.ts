import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  ArrayMinSize,
  Matches,
} from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  @IsNotEmpty({ message: 'Interview name must not be empty' })
  name: string;

  @IsDateString({}, { message: 'Date must be a valid ISO timestamp' })
  date: string;

  // @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{25,}$/, {
    message: 'Google Drive ID must be a valid raw ID (not a URL)',
  })
  gDriveId?: string;

  @IsOptional()
  @IsString()
  requestDistillation?: string;

  @IsOptional()
  @IsString()
  requestCoaching?: string;

  @IsOptional()
  @IsString()
  requestUserStories?: string;

  @IsUUID('4', { message: 'Invalid client ID format' })
  clientId: string;

  @IsUUID('4', { message: 'Invalid project ID format' })
  projectId: string;

  @IsArray({ message: 'Stakeholders must be an array of UUIDs' })
  @ArrayMinSize(1, { message: 'At least one stakeholder must be assigned' })
  @IsUUID('4', {
    each: true,
    message: 'Each stakeholder ID must be a valid UUID',
  })
  stakeholderIds: string[];
}
