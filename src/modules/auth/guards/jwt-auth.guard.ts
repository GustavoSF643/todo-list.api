import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

import type { JwtPayload } from "@application/auth";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException("Token de autenticação ausente.");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      request["user"] = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado.");
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    const [type, token] = header?.split(/\s+/) ?? [];

    if (type?.toLowerCase() !== "bearer" || !token) {
      return undefined;
    }

    return token;
  }
}
