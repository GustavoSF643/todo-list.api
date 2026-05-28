import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import type { JwtPayload } from "@application/auth";
import { IS_PUBLIC_KEY } from "@modules/auth/decorators/public.decorator";
import { E2E_PERMISSION_ID, E2E_USER_ID } from "../fixtures/e2e-fixtures";

const reflector = new Reflector();

export const testJwtAuthGuard: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token de autenticação ausente.");
    }

    req["user"] = {
      sub: E2E_USER_ID,
      email: "john@example.com",
      permission_id: E2E_PERMISSION_ID,
    } satisfies JwtPayload;

    return true;
  },
};

export const allowPermissionsGuard: CanActivate = {
  canActivate: () => true,
};
