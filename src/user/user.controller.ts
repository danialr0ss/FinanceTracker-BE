import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  ValidationPipe,
  UsePipes,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { UserDto } from '../dto/user.dto';
import { Response } from '../common/interfaces/response';
import { AccountDto } from 'src/dto/account.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async create(@Body() user: UserDto): Promise<Omit<User, 'password'>> {
    return this.userService.register(user);
  }

  // @Get()
  // async getUsers(): Promise<Response<User[]>> {
  //   const result = await this.userService.getAllUsers();
  //   return { data: result };
  // }

  // @Get(':id')
  // async getUser(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<Response<User>> {
  //   const result = await this.userService.getUsersById(id);

  //   if (!result) {
  //     throw new NotFoundException(`Item with id:${id} does not exist`);
  //   }

  //   return { data: result };
  // }

  // @Put(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() name: string,
  // ): Promise<Response<User>> {
  //   const result = await this.userService.updateName(id, name);
  //   if (!result) {
  //     throw new NotFoundException(`Item with id:${id} does not exist`);
  //   }
  //   return { data: result };
  // }

  // @Post()
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async create(@Body() user: UserDto): Promise<Response<User>> {
  //   const u = new UserDto();
  //   const result = await this.userService.create(user);
  //   return { data: result };
  // }

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.userService.remove(id);
  // }
}
