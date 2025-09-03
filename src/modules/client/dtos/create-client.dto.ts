import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'Client name must not be empty' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Client code must not be empty' })
  clientCode: string;
}
