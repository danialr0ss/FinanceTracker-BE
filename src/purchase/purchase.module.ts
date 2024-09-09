import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from 'src/account/account.service';

@Module({
  controllers: [PurchaseController],
  providers: [
    PurchaseService,
    AuthService,
    UserService,
    JwtService,
    AccountService,
  ],
})
export class PurchaseModule {}
