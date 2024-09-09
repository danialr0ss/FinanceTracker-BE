import { Decimal } from '@prisma/client/runtime/library';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AccountDto {
  @IsNumber()
  @IsNotEmpty()
  balance: Decimal;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
