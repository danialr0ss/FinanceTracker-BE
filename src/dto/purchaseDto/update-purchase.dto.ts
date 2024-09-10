import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsPositive,
  IsDate,
  IsString,
  isDate,
} from 'class-validator';

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
