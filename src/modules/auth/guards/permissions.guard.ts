import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import type { JwtPayload } from "@application/auth";
import {
  PERMISSION_REPOSITORY,
  type PermissionRepositoryPort,
} from "@application/permissions";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PermissionRoutesService } from "../services/permission-routes.service";

function normalizePath(path: string): string {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1);
  }
  return withLeadingSlash;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly permissionRoutesService: PermissionRoutesService,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepositoryPort,
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
    const method = request.method.toUpperCase();
    const routePath =
      (request.route as { path?: string } | undefined)?.path ?? "";
    const path = normalizePath(`${request.baseUrl}${routePath}`);
    const user = request["user"] as JwtPayload | undefined;

    if (!user?.permission_id) {
      throw new ForbiddenException("Usuário sem permissões definidas.");
    }

    const isSuperAdmin = await this.permissionRepository.isSuperAdmin(
      user.permission_id,
    );

    if (isSuperAdmin) {
      return true;
    }

    const permissionRoutes =
      await this.permissionRoutesService.getPermissionRoutesByPermissionId(
        user.permission_id,
      );

    if (!permissionRoutes.length) {
      throw new ForbiddenException("Usuário sem permissões definidas.");
    }

    const hasAccess = permissionRoutes.some(
      (route) =>
        route.method.toUpperCase() === method &&
        normalizePath(route.path) === path,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        "Sua conta não possui permissão para acessar este recurso.",
      );
    }

    return true;
  }
}
