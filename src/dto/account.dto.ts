import Decimal from 'decimal.js';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class AccountDto {
  id?: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => new Decimal(value))
  balance: Decimal;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
