import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateClientStakeholderDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Stakeholder name must not be empty if provided' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Email must not be empty if provided' })
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Phone must not be empty if provided' })
  phone?: string;
}
