import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Purchase } from '@prisma/client';
import { PurchaseResponse } from 'src/common/interfaces/purchasesResponse';
import { CreatePurchaseDto } from 'src/dto/purchaseDto/create-purchase.dto';
import prisma from 'src/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { UpdatePurchaseDto } from 'src/dto/purchaseDto/update-purchase.dto';
import { AuthService } from 'src/auth/auth.service';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class PurchaseService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
  ) {}
  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const category = createPurchaseDto.category;
    try {
      return await prisma.purchase.create({
        data: {
          amount: createPurchaseDto.amount,
          account_id: createPurchaseDto.account_id,
          category: category[0].toUpperCase() + category.substring(1),
        },
      });
    } catch (err) {
      if (err.code === 'P2003') {
        throw new BadRequestException(
          'Request does not match database requirement, trying to create purchase for account that does not exist',
        );
      }
    }
  }

  async findAllByAccountId(id: number): Promise<Purchase[]> {
    try {
      return await prisma.purchase.findMany({ where: { account_id: id } });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
  }

  async findById(id: number): Promise<Purchase> {
    try {
      return await prisma.purchase.findUnique({ where: { id: id } });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
  }

  async findAllByMonth(
    accountId: number,
    month: number,
    year: number,
  ): Promise<PurchaseResponse> {
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    try {
      const purchases = await prisma.purchase.findMany({
        where: {
          account_id: accountId,
          date: { gte: startDate, lte: endDate },
        },
      });
      return {
        purchases: purchases,
        total: purchases.reduce(
          (accumulator, item) => item.amount.plus(accumulator),
          new Decimal(0),
        ),
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
  }

  async findAllByCategory(
    accountId: number,
    category: string,
  ): Promise<PurchaseResponse> {
    try {
      const purchases = await prisma.purchase.findMany({
        where: { account_id: accountId, category: category },
      });

      return {
        purchases: purchases,
        total: purchases.reduce(
          (accumulator, item) => item.amount.plus(accumulator),
          new Decimal(0),
        ),
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
  }

  async update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    try {
      return await prisma.purchase.update({
        where: { id: id },
        data: { ...updatePurchaseDto },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
        err,
      );
    }
  }

  async delete(id: number) {
    try {
      return await prisma.purchase.delete({ where: { id: id } });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
        err,
      );
    }
  }
}
