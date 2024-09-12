import Decimal from 'decimal.js';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsDate, IsString } from 'class-validator';

export class UpdatePurchaseDto {
  @IsOptional()
  @IsPositive()
  amount: Decimal;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date: Date;
}
