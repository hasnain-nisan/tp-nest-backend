import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  @IsNotEmpty({ message: 'Interview name must not be empty' })
  name: string;

  @IsDateString({}, { message: 'Date must be a valid ISO timestamp' })
  date: string;

  @IsOptional()
  @IsString()
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
}
