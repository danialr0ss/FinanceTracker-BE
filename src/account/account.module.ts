import { forwardRef, Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { PurchaseModule } from 'src/purchase/purchase.module';
import { AuthModule } from 'src/auth/auth.module';
import { ValidUserGuard } from 'src/guards/valid-user/valid-user.guard';

@Module({
  imports: [forwardRef(() => PurchaseModule), forwardRef(() => AuthModule)],
  controllers: [AccountController],
  providers: [AccountService, ValidUserGuard],
  exports: [AccountService],
})
export class AccountModule {}
