import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';

@Injectable()
export class WhoAreYouGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const whoAreYou = request.headers['who_are_you'];

    const expected = '0xPunnawit888';

    if (!expected) {
      throw new UnauthorizedException('WHO_ARE_YOU not configured');
    }

    if (!whoAreYou || whoAreYou !== expected) {
      throw new UnauthorizedException('Invalid who_are_you header');
    }

    return true;
  }
}
