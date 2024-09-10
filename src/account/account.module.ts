import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PurchaseService } from 'src/purchase/purchase.service';

@Module({
  controllers: [AccountController],
  providers: [
    AccountService,
    AuthService,
    UserService,
    JwtService,
    PurchaseService,
  ],
})
export class AccountModule {}
