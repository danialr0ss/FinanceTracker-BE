import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseFloatPipe,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountDto } from 'src/dto/account.dto';
import { AuthorizationGuard } from 'src/guards/authorization/authorization.guard';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Patch('/update-budget/:budget')
  @UseGuards(AuthorizationGuard)
  async update(
    @Param('budget', ParseFloatPipe) budget: number,
  ): Promise<AccountDto> {
    // decodejwt
    const newBudget = 100;
    return this.accountService.updateBudget(budget);
  }
}
