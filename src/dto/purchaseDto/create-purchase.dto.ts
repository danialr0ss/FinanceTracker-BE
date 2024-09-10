import { Decimal } from '@prisma/client/runtime/library';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreatePurchaseDto {
  @IsPositive()
  @IsNotEmpty()
  amount: Decimal;

  @IsNumber()
  @IsNotEmpty()
  account_id: number;

  @IsString()
  @IsNotEmpty()
  category: string;
}
