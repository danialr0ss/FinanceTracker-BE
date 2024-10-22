import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Res,
  Req,
  UnauthorizedException,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/dto/usersDto/user.dto';
import { UserAccountDto } from 'src/dto/user-account.dto';
import { User } from '@prisma/client';
import { Response } from 'express';
import { ValidUserGuard } from 'src/guards/valid-user/valid-user.guard';
import { changePasswordUserDto } from 'src/dto/usersDto/change-password-user.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() user: UserDto, @Res() res: Response) {
    const result = await this.authService.createToken(user);
    res.cookie('token', result, {
      httpOnly: true,
      maxAge: 3600000,
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

  @Post('/signout')
  @UseGuards(ValidUserGuard)
  async signout(@Res() res: Response): Promise<Response> {
    await this.authService.signout(res);
    return res.status(200).json({ message: 'Signout succesful' });
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

  @Post('/change-password')
  @UseGuards(ValidUserGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async changePassword(
    @Body() passwords: changePasswordUserDto,
    @Req() req: Request,
    @Res() res,
  ): Promise<Response> {
    try {
      if (passwords.password === passwords.newPassword) {
        throw new BadRequestException(
          'New password cannot be the same as the current',
        );
      }
      const token = req.cookies['token'];
      const user = await this.authService.getJwtPayload(token);

      const originalCredentials = new UserDto();
      originalCredentials.password = passwords.password;
      originalCredentials.name = user.name;

      const newCredentials = new UserDto();
      newCredentials.password = passwords.newPassword;
      newCredentials.name = user.name;

      await this.authService.createToken(originalCredentials);
      await this.authService.changePassword(newCredentials);
    } catch (err) {
      return res
        .status(err.status)
        .json({ error: err.error, message: err.message });
    }
    return res.status(200).json({ message: 'Password changed successfully' });
  }
}
