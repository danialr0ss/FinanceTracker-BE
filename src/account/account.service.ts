import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Account, Purchase } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Breakdown } from 'src/common/interfaces/breakdown';
import { PurchaseResponse } from 'src/common/interfaces/purchasesResponse';
import prisma from 'src/prisma/prisma.service';
import { PurchaseService } from 'src/purchase/purchase.service';

@Injectable()
export class AccountService {
  constructor(private readonly purchaseService: PurchaseService) {}

  async updateBalance(id: number, newBalance: Decimal): Promise<Account> {
    try {
      return await prisma.account.update({
        where: { id: id },
        data: { balance: newBalance },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
  }

  async findByUserId(id: number): Promise<Account> {
    try {
      return await prisma.account.findUnique({ where: { user_id: id } });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
  }

  async findById(id: number): Promise<Account> {
    try {
      return await prisma.account.findUnique({ where: { id: id } });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
  }

  async generateMonthlyBreakdown(userId: number) {
    const { id: accountId, balance } = await this.findByUserId(userId);
    const purchases = await this.purchaseService.findAllByAccountId(accountId);
    const result: Map<
      string, // monthYear
      {
        purchases: Map<
          string, //category
          { purchases: Purchase[]; total: Decimal }
        >;
        balance: Decimal;
      }
    > = new Map();

    for (const purchase of purchases) {
      const monthYear = `${purchase.date.getMonth()} ${purchase.date.getFullYear()}`;
      if (result.has(monthYear)) {
        const monthlyPurchases = result.get(monthYear).purchases;

        if (monthlyPurchases.has(purchase.category)) {
          const categoryPurchases = monthlyPurchases.get(purchase.category);
          categoryPurchases.purchases.push(purchase);
          categoryPurchases.total.add(purchase.amount);
        } else {
          monthlyPurchases.set(purchase.category, {
            purchases: [purchase],
            total: new Decimal(0),
          });
        }
      } else {
        result.set(monthYear, {
          purchases: new Map([
            [
              purchase.category,
              {
                purchases: [purchase],
                total: new Decimal(0),
              },
            ],
          ]),
          balance: balance,
        });
      }
    }

    return result;
  }

  // find many incase multiple account feature is added
  // async findByUserId(id: number) {
  //   try {
  //     return await prisma.account.findMany({ where: { user_id: id } });
  //   } catch (err) {
  //     throw new InternalServerErrorException(
  //       'Something went wrong with Prisma',
  //     );
  //   }
  // }
}
