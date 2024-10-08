import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/dto/user.dto';
import { UserAccountDto } from 'src/dto/user-account.dto';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() user: UserDto): Promise<Token> {
    const result = await this.authService.createToken(user);
    return { token: result };
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
}
