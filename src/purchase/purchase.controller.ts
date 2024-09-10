import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UseGuards,
  Headers,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from 'src/dto/purchaseDto/create-purchase.dto';
import { Purchase } from '@prisma/client';
import { ValidUserGuard } from 'src/guards/valid-user/valid-user.guard';
import { AuthService } from 'src/auth/auth.service';
import { AccountService } from 'src/account/account.service';
import { Decimal } from '@prisma/client/runtime/library';
import { PurchaseResponse } from 'src/common/interfaces/purchasesResponse';
import { parse } from 'querystring';
import { Validator } from 'class-validator';
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
  ): Promise<PurchaseResponse> {
    const token = headers.split(' ')[1];
    const { id: userId } = await this.authService.getJwtPayload(token);
    const { id: accountId } = await this.accountService.findByUserId(userId);

    if (accountId !== createPurchaseDto.account_id) {
      throw new UnauthorizedException(
        'Purchases can only be added to accounts linked to user',
      );
    }

    await this.purchaseService.create(createPurchaseDto);
    const purchases = await this.purchaseService.findAllByAccountId(accountId);
    const { balance } = await this.accountService.findByUserId(userId);

    const newBalance = balance.minus(createPurchaseDto.amount);
    this.accountService.updateBalance(userId, newBalance);

    return { purchases: purchases, balance: newBalance };
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

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.purchaseService.findOne(+id);
  // }

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
    console.log(updatePurchaseDto);
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.purchaseService.remove(+id);
  // }
}
