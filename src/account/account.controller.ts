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
  async update(
    @Body() account: AccountDto,
    @Headers('authorization') header: string,
  ): Promise<Account> {
    //validate if user has ownership
    const token = header.split(' ')[1];
    const { balance, user_id } = account;
    const user = await this.authService.getJwtPayload(token);
    if (user.id !== user_id) {
      throw new UnauthorizedException(
        'Updates can only be done to accounts linked to user',
      );
    }
    const { id } = await this.accountService.findByUserId(user_id);

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
