import {
  Controller,
  Headers,
  Body,
  Patch,
  UseGuards,
  ValidationPipe,
  UsePipes,
  UnauthorizedException,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { ValidUserGuard } from 'src/guards/valid-user/valid-user.guard';
import { AccountDto } from 'src/dto/account.dto';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(ValidUserGuard)
  async findAccount(@Headers('authorization') header: string) {
    return this.accountService.findAccount(header);
  }

  @Patch('/update-balance')
  @UseGuards(ValidUserGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async update(@Headers('authorization') header: string): Promise<Account> {
    const { id, balance } = await this.findAccount(header);
    return this.accountService.updateBalance(id, balance);
  }

  @Get('/breakdown')
  @UseGuards(ValidUserGuard)
  async generateAccountBreakdown(@Headers('authorization') header: string) {
    const token = header.split(' ')[1];
    const { id: userId } = await this.authService.getJwtPayload(token);
    return this.accountService.generateMonthlyBreakdown(userId);
  }
}
