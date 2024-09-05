import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsInt()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
