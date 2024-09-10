import { Purchase } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface Breakdown {
  month: number;
  purchases: { [category: string]: Purchase[] };
  balance: Decimal;
}
