import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Client name must not be empty if provided' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Client code must not be empty if provided' })
  clientCode?: string;
}
