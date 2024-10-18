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
import { AccountService } from 'src/account/account.service';

@Injectable()
export class PurchaseService {
  constructor(
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
  ) {}
  async create(
    createPurchaseDto: CreatePurchaseDto,
    accountId: number,
  ): Promise<Purchase> {
    try {
      return await prisma.purchase.create({
        data: {
          amount: createPurchaseDto.amount,
          account_id: accountId,
          category: createPurchaseDto.category,
          date: createPurchaseDto.date,
          label: createPurchaseDto.label,
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

  // user can only update and delete purchase in thier account
  async verifyAccess(token: string, purchaseId: number) {
    const { id: userAccountId } = await this.accountService
      .findAccount(token)
      .catch((err) => {
        throw new InternalServerErrorException(err.message);
      });
    const { account_id: purchaseAccountId } = await this.findById(
      purchaseId,
    ).catch((err) => {
      throw new InternalServerErrorException(err.message);
    });

    if (userAccountId !== purchaseAccountId) {
      throw new ForbiddenException(
        'Update or removal of purchase can only be done by owner',
      );
    }
  }
}
