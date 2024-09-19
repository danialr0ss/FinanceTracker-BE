import {
  Controller,
  Headers,
  Patch,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from '@prisma/client';
import { ValidUserGuard } from 'src/guards/valid-user/valid-user.guard';
import { AccountDto } from 'src/dto/account.dto';
import Decimal from 'decimal.js';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @UseGuards(ValidUserGuard)
  async findAccount(@Headers('authorization') header: string) {
    return this.accountService.findAccount(header);
  }

  @Patch('/update-balance')
  @UseGuards(ValidUserGuard)
  async update(
    @Headers('authorization') header: string,
    @Body() accountDto: AccountDto,
  ): Promise<Account> {
    const balance = new Decimal(accountDto.balance);
    const { id } = await this.findAccount(header);
    return this.accountService.updateBalance(id, balance);
  }

  @Get('/breakdown')
  @UseGuards(ValidUserGuard)
  async generateAccountBreakdown(@Headers('authorization') header: string) {
    const { user_id } = await this.findAccount(header);
    return this.accountService.generateMonthlyBreakdown(user_id);
  }
}
