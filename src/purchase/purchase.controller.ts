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
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseDto } from 'src/dto/purchase.dto';
import { Purchase } from '@prisma/client';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  create(@Body() purchaseDto: PurchaseDto): Promise<Purchase> {
    return this.purchaseService.create(purchaseDto);
  }

  // @Get()
  // findAll() {
  //   return this.purchaseService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.purchaseService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() purchaseDto: PurchaseDto) {
  //   return this.purchaseService.update(+id, purchaseDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.purchaseService.remove(+id);
  // }
}
