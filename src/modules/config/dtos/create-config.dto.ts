import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  IsObject,
  IsUrl,
  ArrayNotEmpty,
  ValidateIf,
} from 'class-validator';

export class CreateConfigDto {
  @ValidateIf(
    (obj) => typeof obj.projectId === 'string' && obj.projectId.trim() !== '',
  )
  @IsUUID('4', { message: 'Invalid project ID format' })
  projectId?: string;

  @IsString()
  @IsOptional()
  example1?: string;

  @IsString()
  @IsOptional()
  example2?: string;

  @IsString()
  @IsOptional()
  example3?: string;

  @IsString()
  @IsOptional()
  categories_flag?: string;

  @IsObject({ message: 'us_categories must be a valid JSON object' })
  @IsOptional()
  us_categories?: Record<string, string>;

  @IsString()
  @IsOptional()
  custom_context?: string;

  @IsArray()
  @ArrayNotEmpty({
    message: 'email_confirmation must contain at least one email',
  })
  @IsString({ each: true })
  @IsOptional()
  email_confirmation?: string[];

  @IsString()
  interview_tracker_gdrive_id: string;

  @IsUrl()
  @IsOptional()
  interview_repository_gdrive_url?: string;

  @IsUrl()
  @IsOptional()
  global_repository_gdrive_url?: string;

  @IsUrl()
  @IsOptional()
  output_gdrive_url?: string;

  @IsUrl()
  @IsOptional()
  logging_output_url?: string;

  @IsString()
  @IsOptional()
  change_summary?: string;
}
