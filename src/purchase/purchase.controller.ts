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
  Query,
  ParseIntPipe,
  Delete,
  Req,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from 'src/dto/purchaseDto/create-purchase.dto';
import { Purchase } from '@prisma/client';
import { ValidUserGuard } from 'src/guards/valid-user/valid-user.guard';
import { AccountService } from 'src/account/account.service';
import { PurchaseResponse } from 'src/common/interfaces/purchasesResponse';
import { UpdatePurchaseDto } from 'src/dto/purchaseDto/update-purchase.dto';
import { Request } from 'express';

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
    @Req() req: Request,
  ): Promise<Purchase> {
    const token = req.cookies['token'];
    const { id: accountId } = await this.accountService.findAccount(token);
    return await this.purchaseService.create(createPurchaseDto, accountId);
  }

  @Get('')
  @UseGuards(ValidUserGuard)
  async find(
    @Req() req: Request,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('category') category: string,
  ): Promise<PurchaseResponse> {
    if (month && (month < 1 || month > 12)) {
      throw new BadRequestException(
        'Month must be between 1 (January) to 12 (December)',
      );
    }

    const currYear = new Date().getFullYear();
    if (year && year > currYear) {
      throw new BadRequestException(
        `Year must be this year (${currYear}) or earlier`,
      );
    }
    const token = req.cookies['token'];
    const { id: accountId } = await this.accountService.findAccount(token);
    return this.purchaseService.find(accountId, category, month, year);
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
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    const token = req.cookies['token'];
    await this.purchaseService.verifyAccess(token, id);
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  @Delete(':id')
  @UseGuards(ValidUserGuard)
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const token = req.cookies['token'];
    await this.purchaseService.verifyAccess(token, id);
    return this.purchaseService.delete(id);
  }
}
