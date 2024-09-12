import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UseGuards,
  Headers,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from 'src/dto/purchaseDto/create-purchase.dto';
import { Purchase } from '@prisma/client';
import { ValidUserGuard } from 'src/guards/valid-user/valid-user.guard';
import { AuthService } from 'src/auth/auth.service';
import { AccountService } from 'src/account/account.service';
import { PurchaseResponse } from 'src/common/interfaces/purchasesResponse';
import { UpdatePurchaseDto } from 'src/dto/purchaseDto/update-purchase.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  @Post()
  @UseGuards(ValidUserGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @Headers('authorization') headers,
  ): Promise<Purchase> {
    const accountId = createPurchaseDto.account_id;
    const token = headers.split(' ')[1];
    // check if user can do actions to the record
    await this.authService.checkUserAccess(token, accountId);
    const { balance } = await this.accountService.findById(accountId);
    const newBalance = balance.minus(createPurchaseDto.amount);
    this.accountService.updateBalance(accountId, newBalance);

    return await this.purchaseService.create(createPurchaseDto);
  }

  @Get(':id/:month/:year')
  @UseGuards(ValidUserGuard)
  findAllByMonth(
    @Param('id', ParseIntPipe) id: number,
    @Param('month', ParseIntPipe) month: number,
    @Param('year', ParseIntPipe) year: number,
  ): Promise<PurchaseResponse> {
    if (month > 12) {
      throw new BadRequestException(
        'Month must be between 1 (January) to 12 (December)',
      );
    }

    const currYear = new Date().getFullYear();
    if (year > currYear) {
      throw new BadRequestException(
        `Year must be this year (${currYear}) or earlier`,
      );
    }

    return this.purchaseService.findAllByMonth(id, month, year);
  }

  @Get(':id/:category')
  @UseGuards(ValidUserGuard)
  findAllByCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('category') category: string,
  ) {
    return this.purchaseService.findAllByCategory(id, category);
  }

  @Patch(':id')
  @UseGuards(ValidUserGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.purchaseService.delete(id);
  }
}
