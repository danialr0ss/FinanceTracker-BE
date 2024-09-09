import { Purchase } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface PurchaseResponse {
  purchases: Purchase[];
  balance?: Decimal;
  total?: Decimal;
}
