import Decimal from 'decimal.js';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePurchaseDto {
  @IsPositive()
  @IsNotEmpty()
  amount: Decimal;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDate()
  @IsOptional()
  date: Date;
}
