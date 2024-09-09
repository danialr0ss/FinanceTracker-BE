import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { comparePassword, hashPassword } from 'src/utils/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // create token for users who are allowed to sign in
  async generateToken(user: UserDto): Promise<string> {
    const foundUser = await this.userService.getUserByName(user.name);

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
      throw new InternalServerErrorException(error);
    }
  }

  // if token is valid, signed item will be returned, if not error will occur
  //used to check if user is logged in
  async getPayloadFromToken(token: string): Promise<Omit<User, 'password'>> {
    try {
      const { user } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return user;
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
