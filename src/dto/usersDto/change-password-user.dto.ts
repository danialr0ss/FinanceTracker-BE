import { IsString, IsNotEmpty } from 'class-validator';

export class changePasswordUserDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
