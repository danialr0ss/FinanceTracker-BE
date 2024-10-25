import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import prisma from 'src/prisma/prisma.service';
@Injectable()
export class AccountService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  //recalculate when user adds a new purchase
  async findByUserId(id: number): Promise<Account> {
    try {
      return await prisma.account.findUnique({ where: { user_id: id } });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with prisma, failed to retrieve account by user id',
      );
    }
  }

  async findAccount(token: string) {
    const { id: userId } = await this.authService.getJwtPayload(token);
    return this.findByUserId(userId);
  }
}
