import { forwardRef, Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => AccountModule)],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
