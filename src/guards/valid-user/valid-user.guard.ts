import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';

@Injectable()
export class ValidUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['token'];

    if (!token) {
      throw new UnauthorizedException(
        'You do not have the required permissions.',
      );
    }

    try {
      //if payload can be received means the token is valid
      await this.authService.getJwtPayload(token);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
    return true;
  }
}
