import {
  Controller,
  Headers,
  Body,
  Patch,
  UseGuards,
  ValidationPipe,
  UsePipes,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { ValidUserGuard } from 'src/guards/valid-user/valid-user.guard';
import { OwnershipGuard } from 'src/guards/ownership/ownership.guard';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
  ) {}

  @Patch('/update-balance')
  @UseGuards(ValidUserGuard)
  @UseGuards(OwnershipGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Body() balance: string,
    @Headers('authorization') header: string,
  ): Promise<Account> {
    const token = header.split(' ')[1];
    const user = await this.authService.getPayloadFromToken(token);

    //this.accountService.updateBudget(accountId, balance);
    return;
  }
}
