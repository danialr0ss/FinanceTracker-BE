import { Injectable, OnModuleInit } from '@nestjs/common';
import { AccountDto } from 'src/dto/account.dto';
import prisma from 'src/prisma/prisma.service';

@Injectable()
export class AccountService {
  create(createAccountDto: AccountDto) {
    return 'This action adds a new account';
  }

  findAll() {
    return `This action returns all account`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  updateBudget(newBudget: number): Promise<AccountDto> {
    return null;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
