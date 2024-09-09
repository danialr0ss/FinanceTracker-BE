import { IsNotEmpty, isNumber, IsNumber } from 'class-validator';

export class AccountDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
