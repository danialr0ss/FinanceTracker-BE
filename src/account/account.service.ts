import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Account, Purchase } from '@prisma/client';
import Decimal from 'decimal.js';
import { AuthService } from 'src/auth/auth.service';
import prisma from 'src/prisma/prisma.service';
import { PurchaseService } from 'src/purchase/purchase.service';
@Injectable()
export class AccountService {
  constructor(
    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  //recalculate when user adds a new purchase
  async recalculateBudget(
    id: number,
    purchaseAmount: Decimal,
  ): Promise<Account> {
    const { budget } = await this.findById(id);
    const newBudget = budget.minus(purchaseAmount);

    try {
      return await prisma.account.update({
        where: { id: id },
        data: { budget: newBudget },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with prisma, failed to update account',
      );
    }
  }

  //update when user changes the budget amount of the account
  async updateBudget(id: number, budget: Decimal) {
    const purchases = await this.purchaseService.findAllByAccountId(id);

    let totalAmount = new Decimal(0);
    for (const purchase of purchases) {
      totalAmount = totalAmount.plus(purchase.amount);
    }

    const newBudget = budget.minus(totalAmount);

    try {
      return await prisma.account.update({
        where: { id: id },
        data: { budget: newBudget },
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async findByUserId(id: number): Promise<Account> {
    try {
      return await prisma.account.findUnique({ where: { user_id: id } });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with prisma, failed to retrieve account by user id',
      );
    }
  }

  async findById(id: number): Promise<Account> {
    try {
      return await prisma.account.findUnique({ where: { id: id } });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with prisma, failed to retrieve account by id',
      );
    }
  }

  async generateMonthlyBreakdown(userId: number) {
    const { id: accountId } = await this.findByUserId(userId);
    const purchases = await this.purchaseService.findAllByAccountId(accountId);
    const result: Map<
      string, // monthYear
      {
        purchases: Map<
          string, //category
          { purchases: Purchase[]; total: Decimal }
        >;
      }
    > = new Map();

    for (const purchase of purchases) {
      const monthYear = `${purchase.date.getMonth()}-${purchase.date.getFullYear()}`;

      if (result.has(monthYear)) {
        const monthlyPurchases = result.get(monthYear).purchases;

        if (monthlyPurchases.has(purchase.category)) {
          const categoryPurchases = monthlyPurchases.get(purchase.category);
          categoryPurchases.purchases.push(purchase);
          categoryPurchases.total = categoryPurchases.total.add(
            purchase.amount,
          );
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
                total: new Decimal(purchase.amount),
              },
            ],
          ]),
        });
      }
    }

    // change to json format to send to user
    const formattedResult = [];
    for (const key of result.keys()) {
      const categories = result.get(key).purchases;
      for (const category of categories.keys()) {
        const monthlySpending = {
          date: key, // key is the monthYear,
          category: category,
          purchases: categories.get(category).purchases,
          total: categories.get(category).total,
        };
        formattedResult.push(monthlySpending);
      }
    }
    return formattedResult;
  }

  async findAccount(token: string) {
    const { id: userId } = await this.authService.getJwtPayload(token);
    return this.findByUserId(userId);
  }

  // get the amount you can spend in a day with the current budget
  async calculateDailyBudget(id: number): Promise<Number> {
    const today = new Date();
    const dayBefore = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
    );
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    // use day before so that you include "today" when getting the budget
    const remainingDays = endOfMonth.getDate() - dayBefore.getDate();
    const { budget } = await this.findById(id);
    return Number(budget.dividedBy(remainingDays).toDecimalPlaces(2));
  }
}
