import { IsNotEmpty, IsNumber } from 'class-validator';

export class PurchaseDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  account_id: number;
}
