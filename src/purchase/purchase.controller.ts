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
import { AccountService } from 'src/account/account.service';
import { PurchaseResponse } from 'src/common/interfaces/purchasesResponse';
import { UpdatePurchaseDto } from 'src/dto/purchaseDto/update-purchase.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private readonly purchaseService: PurchaseService,
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
    @Headers('authorization') header,
  ): Promise<Purchase> {
    const { id: accountId } = await this.accountService.findAccount(header);
    this.accountService.recalculateBudget(accountId, createPurchaseDto.amount);
    return await this.purchaseService.create(createPurchaseDto, accountId);
  }

  @Get(':month/:year')
  @UseGuards(ValidUserGuard)
  async findAllByMonth(
    @Headers('authorization') header: string,
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

    const { id: accountId } = await this.accountService.findAccount(header);
    return this.purchaseService.findAllByMonth(accountId, month, year);
  }

  @Get(':category')
  @UseGuards(ValidUserGuard)
  async findAllByCategory(
    @Headers('authorization') header: string,
    @Param('category') category: string,
  ) {
    const { id: accountId } = await this.accountService.findAccount(header);
    return this.purchaseService.findAllByCategory(accountId, category);
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
  async update(
    @Headers('authorization') header: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    await this.purchaseService.verifyAccess(header, id);
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  @Delete(':id')
  @UseGuards(ValidUserGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') header: string,
  ) {
    await this.purchaseService.verifyAccess(header, id);
    return this.purchaseService.delete(id);
  }
}
