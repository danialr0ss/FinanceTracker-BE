import { UserDto } from './user.dto';
import { AccountDto } from './account.dto';
import { IsObject } from 'class-validator';

export class UserAccountDto {
  @IsObject()
  user: UserDto;
  @IsObject()
  account: AccountDto;
}
