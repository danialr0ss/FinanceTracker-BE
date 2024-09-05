import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';
import { PrismaClient, User } from '@prisma/client';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { hashPassword } from 'src/utils/utils';
import prisma from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  async getUserByName(name: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        name: name,
      },
    });
  }

  async register(user: UserDto): Promise<Omit<User, 'password'>> {
    const { name } = user;

    const foundUser = await prisma.user.findUnique({
      where: { name: name },
    });

    if (foundUser) {
      throw new BadRequestException(`User with name : ${name} already exists`);
    }

    user.password = await hashPassword(user.password);

    const createdUser = await prisma.user
      .create({ data: { ...user, account: { create: { balance: 0 } } } })
      .catch((err) => {
        console.log(err);
        throw new InternalServerErrorException(
          'Something went wrong with Prisma',
        );
      });

    const { password, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }

  // async getAllUsers(): Promise<User[] | null> {
  //   return this.prisma.user.findMany();
  // }

  // async getUsersById(id: number): Promise<User | null> {
  //   return this.prisma.user.findUnique({ where: { id: id } });
  // }

  // async updateName(id: number, name: string): Promise<User | null> {
  //   const foundUser = await this.prisma.user.findUnique({ where: { id: id } });
  //   if (!foundUser) {
  //     throw new BadRequestException(`User with id:${id} does not exist`);
  //   }

  //   return this.prisma.user.update({ where: { id: id }, data: name });
  // }

  // async remove(id: number) {
  //   const foundUser = await this.prisma.user.findUnique({ where: { id: id } });
  //   if (!foundUser) {
  //     throw new BadRequestException(`User with id : ${id} does not exist`);
  //   }

  //   return this.prisma.user.delete({ where: { id: id } }).catch(() => {
  //     throw new InternalServerErrorException(
  //       'Something went wrong with Prisma',
  //     );
  //   });
  // }
}
