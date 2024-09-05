import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AuthorizationGuard } from 'src/guards/authorization/authorization.guard';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AccountController],
  providers: [
    AccountService,
    AuthorizationGuard,
    AuthService,
    UserService,
    JwtService,
  ],
})
export class AccountModule {}
