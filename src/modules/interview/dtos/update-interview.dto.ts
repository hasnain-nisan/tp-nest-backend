import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class UpdateInterviewDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Interview name must not be empty if provided' })
  name?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Date must be a valid ISO timestamp if provided' },
  )
  date?: string;

  @IsOptional()
  @IsString()
  gDriveId?: string;

  @IsOptional()
  @IsBoolean()
  requestDistillation?: boolean;

  @IsOptional()
  @IsBoolean()
  requestCoaching?: boolean;

  @IsOptional()
  @IsBoolean()
  requestUserStories?: boolean;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid client ID format' })
  clientId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid project ID format' })
  projectId: string;

  @IsOptional()
  @IsArray({ message: 'Stakeholders must be an array of UUIDs' })
  @IsUUID('4', {
    each: true,
    message: 'Each stakeholder ID must be a valid UUID',
  })
  stakeholderIds?: string[];
}
