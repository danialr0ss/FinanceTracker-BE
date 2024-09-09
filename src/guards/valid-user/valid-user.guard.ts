import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ValidUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException(
        'You do not have the required permissions.',
      );
    }

    // get token part of the header
    const token = authHeader.split(' ')[1];

    try {
      //if payload can be received means the token is valid
      await this.authService.getJwtPayload(token);
    } catch (err) {
      throw new UnauthorizedException(err);
    }
    return true;
  }
}
