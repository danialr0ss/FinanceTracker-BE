import Decimal from 'decimal.js';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class AccountDto {
  id?: number;

  @IsNotEmpty()
  @IsPositive()
  balance: Decimal;

  user_id?: number;
}
