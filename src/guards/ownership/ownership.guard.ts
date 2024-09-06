import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    const token = authHeader.split(' ')[1];
    const user = await this.authService.getPayloadFromToken(token);

    const user_id = request.body['user_id'];
    if (!user_id) {
      throw new BadRequestException('user_id is missing');
    }

    const accountsWithUserId =
      await this.accountService.getAllAccountWithUserId(user_id);

    if (accountsWithUserId.length == 0) {
      throw new UnauthorizedException(
        'Updates can only be done to accounts linked to user',
      );
    }

    return true;
  }
}
