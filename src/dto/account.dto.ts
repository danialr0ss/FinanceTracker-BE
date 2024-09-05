import { IsNotEmpty, IsNumber } from 'class-validator';

export class AccountDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number;
}
