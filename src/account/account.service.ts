import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';
import prisma from 'src/prisma/prisma.service';

@Injectable()
export class AccountService {
  updateBudget(userId: number, newBalance: number): Promise<Account> {
    return prisma.account.update({
      where: { user_id: userId },
      data: { balance: newBalance },
    });
  }

  // find many incase multiple account feature is added
  getAllAccountWithUserId(id: number) {
    return prisma.account.findMany({ where: { user_id: id } });
  }
}
