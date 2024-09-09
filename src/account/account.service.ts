import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Account } from '@prisma/client';
import prisma from 'src/prisma/prisma.service';

@Injectable()
export class AccountService {
  async updateBalance(userId: number, newBalance: number): Promise<Account> {
    try {
      return await prisma.account.update({
        where: { user_id: userId },
        data: { balance: newBalance },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
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
