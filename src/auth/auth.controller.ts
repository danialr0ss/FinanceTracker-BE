import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/dto/user.dto';
import { UserAccountDto } from 'src/dto/user-account.dto';
import { User } from '@prisma/client';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() user: UserDto, @Res() res: Response) {
    const result = await this.authService.createToken(user);
    res.cookie('token', result, {
      httpOnly: true,
      maxAge: 6000,
      sameSite: 'lax',
    });
    return res.status(200).json({ message: 'Login successful' });
  }

  @Post('/register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(
    @Body() userAndAccount: UserAccountDto,
  ): Promise<Omit<User, 'password'>> {
    return this.authService.createUser(
      userAndAccount.user,
      userAndAccount.account,
    );
  }
  @Post('/verify')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verify(@Body() token: Token, @Res() res: Response): Promise<Response> {
    const result = await this.authService.getJwtPayload(token.token);
    if (!result) {
      throw new UnauthorizedException('User unauthorized');
    }
    return res.status(200).json({ message: 'valid' });
  }
}
