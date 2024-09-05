import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(user: UserDto): Promise<string> {
    const foundUser = await this.userService.getUserByName(user.name);

    if (!foundUser || user.password !== foundUser.password) {
      throw new UnauthorizedException('Incorrect Credentails');
    }

    const payload = { sub: foundUser.id, username: foundUser.name };
    return this.jwtService.signAsync(payload);
  }

  async validateToken(token: string): Promise<Omit<User, 'password' | 'id'>> {
    return this.jwtService.verifyAsync(token);
  }
}
