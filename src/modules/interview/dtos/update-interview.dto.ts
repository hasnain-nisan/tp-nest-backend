import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
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
  @IsString()
  requestDistillation?: string;

  @IsOptional()
  @IsString()
  requestCoaching?: string;

  @IsOptional()
  @IsString()
  requestUserStories?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid client ID format' })
  clientId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid project ID format' })
  projectId: string;
}
