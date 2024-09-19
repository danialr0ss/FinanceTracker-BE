import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { UserAccountDto } from 'src/dto/user-account.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async create(
    @Body() userAndAccount: UserAccountDto,
  ): Promise<Omit<User, 'password'>> {
    const { user, account } = userAndAccount;
    return this.userService.createUser(user, account);
  }
}
