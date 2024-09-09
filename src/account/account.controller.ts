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
import { AccountDto } from 'src/dto/account.dto';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
  ) {}

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

    return this.accountService.updateBalance(user_id, balance);
  }
}
