import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() user: UserDto): Promise<Token> {
    const result = await this.authService.createToken(user);
    return { token: result };
  }
}
