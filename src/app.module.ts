import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { PurchaseModule } from './purchase/purchase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    AccountModule,
    PurchaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
