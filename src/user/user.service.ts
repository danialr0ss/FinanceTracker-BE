import { Injectable } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { User } from '@prisma/client';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { hashPassword } from 'src/utils/utils';
import prisma from 'src/prisma/prisma.service';
import { AccountDto } from 'src/dto/account.dto';

@Injectable()
export class UserService {
  async findByName(name: string): Promise<User> {
    try {
      return await prisma.user.findUnique({
        where: {
          name: name,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong with Prisma',
      );
    }
  }

  async createUser(
    user: UserDto,
    account: AccountDto,
  ): Promise<Omit<User, 'password'>> {
    const { name } = user;

    // use chaining to keep in scope
    const foundUser = await prisma.user
      .findUnique({
        where: { name: name },
      })
      .catch((err) => {
        throw new InternalServerErrorException(
          'Something went wrong with Prisma, Error searching user',
          err,
        );
      });

    if (foundUser) {
      throw new BadRequestException(`User with name : ${name} already exists`);
    }

    user.password = await hashPassword(user.password);
    const createdUser = await prisma.user
      .create({
        data: {
          ...user,
          account: { create: { balance: account.balance.toString() } },
        },
      })
      .catch((err) => {
        throw new InternalServerErrorException(
          'Something went wrong with Prisma, Error creating user',
          err,
        );
      });

    const { password, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }
}
