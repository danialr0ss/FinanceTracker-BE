import {
  Controller,
  Patch,
  UseGuards,
  Get,
  Body,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from '@prisma/client';
import { ValidUserGuard } from 'src/guards/valid-user/valid-user.guard';
import { AccountDto } from 'src/dto/account.dto';
import Decimal from 'decimal.js';
import { Request } from 'express';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Patch('/update-balance')
  @UseGuards(ValidUserGuard)
  async update(
    @Req() request: Request,
    @Body() accountDto: AccountDto,
  ): Promise<Account> {
    const token = request.cookies['token'];
    const { id } = await this.accountService.findAccount(token);
    const balance = new Decimal(accountDto.balance);
    return this.accountService.updateBalance(id, balance);
  }

  @Get('/breakdown')
  @UseGuards(ValidUserGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateAccountBreakdown(@Req() req: Request) {
    const token = req.cookies['token'];
    const { user_id } = await this.accountService.findAccount(token);
    return this.accountService.generateMonthlyBreakdown(user_id);
  }

  @Get('/get-daily-budget')
  @UseGuards(ValidUserGuard)
  async getDailyBudget(@Req() request: Request) {
    const token = request.cookies['token'];
    const { id } = await this.accountService.findAccount(token);
    const result = await this.accountService.calculateDailyBudget(id);
    return { dailyBudget: result };
  }
}
