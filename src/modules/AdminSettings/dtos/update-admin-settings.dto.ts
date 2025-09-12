import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class UpdateAdminSettingsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Type must not be empty if provided' })
  type?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  privateKeyId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Private key must not be empty if provided' })
  privateKey?: string;

  @IsOptional()
  @IsEmail(
    {},
    { message: 'Client email must be a valid email address if provided' },
  )
  clientEmail?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Auth URI must be a valid URL if provided' })
  authUri?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Token URI must be a valid URL if provided' })
  tokenUri?: string;

  @IsOptional()
  @IsUrl(
    {},
    { message: 'Auth provider cert URL must be a valid URL if provided' },
  )
  authProviderX509CertUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Client cert URL must be a valid URL if provided' })
  clientX509CertUrl?: string;

  @IsOptional()
  @IsString()
  universeDomain?: string;
}
