import Decimal from 'decimal.js';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class AccountDto {
  @IsNotEmpty()
  @IsPositive()
  budget: Decimal;
}
