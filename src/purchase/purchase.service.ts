import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PurchaseDto } from 'src/dto/purchase.dto';
import prisma from 'src/prisma/prisma.service';

@Injectable()
export class PurchaseService {
  async create(purchase: PurchaseDto) {
    try {
      return await prisma.purchase.create({
        data: { amount: purchase.amount, account_id: purchase.account_id },
      });
    } catch (err) {
      if (err.code === 'P2003') {
        throw new BadRequestException(
          'Request does not match database requirement, trying to create purchase for account that does not exist',
        );
      }
    }
  }

  findAll() {
    return `This action returns all purchase`;
  }

  async findOne(id: number) {
    try {
      return await prisma.purchase.findUnique({ where: { id: id } });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
  }

  update(id: number, purchaseDto: PurchaseDto) {
    return `This action updates a #${id} purchase`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchase`;
  }
}
