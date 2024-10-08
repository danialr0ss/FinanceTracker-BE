import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { comparePassword } from 'src/utils/utils';
import { ConfigService } from '@nestjs/config';
import prisma from 'src/prisma/prisma.service';
import { AccountDto } from 'src/dto/account.dto';
import { hashPassword } from 'src/utils/utils';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // create token for users who are allowed to sign in
  async createToken(user: UserDto): Promise<string> {
    const foundUser = await this.findByName(user.name);

    if (!foundUser) {
      throw new UnauthorizedException('Incorrect Credentials');
    }
    const isAuthorized = await comparePassword(
      user.password,
      foundUser.password,
    );

    if (!isAuthorized) {
      throw new UnauthorizedException('Incorrect Credentials');
    }

    delete foundUser.password;

    const payload = { sub: foundUser.id, user: foundUser };
    try {
      return this.jwtService.signAsync(payload);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // if token is valid, signed item will be returned, if not error will occur
  //used to check if user is logged in
  async getJwtPayload(token: string): Promise<Omit<User, 'password'>> {
    try {
      const { user } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return user;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

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
      throw new BadRequestException(`Username ${name} already taken`);
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
