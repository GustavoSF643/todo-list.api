import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Cache } from "cache-manager";
import { Repository } from "typeorm";

import { RouteEntity } from "@infra/database/entities/route.entity";

type PermissionRoute = {
  method: string;
  path: string;
};

type RouteModuleLabel = {
  name: string;
};

@Injectable()
export class PermissionRoutesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(RouteEntity)
    private readonly routeRepository: Repository<RouteEntity>,
  ) {}

  async getPermissionRoutesByPermissionId(
    permissionId: string,
  ): Promise<PermissionRoute[]> {
    const key = `permission:${permissionId}:routes`;
    const cached = await this.cacheManager.get<PermissionRoute[]>(key);
    if (cached) {
      return cached;
    }

    const routes = await this.routeRepository
      .createQueryBuilder("route")
      .innerJoin(
        "module_route",
        "module_route",
        "module_route.route_id = route.external_id AND module_route.deleted_at IS NULL",
      )
      .innerJoin(
        "module",
        "module",
        "module.external_id = module_route.module_id AND module.deleted_at IS NULL AND module.is_active = true",
      )
      .innerJoin(
        "permission_module",
        "permission_module",
        "permission_module.module_id = module.external_id AND permission_module.deleted_at IS NULL",
      )
      .innerJoin(
        "permission",
        "permission",
        "permission.external_id = permission_module.permission_id AND permission.deleted_at IS NULL AND permission.is_active = true",
      )
      .where("permission.external_id = :permissionId", { permissionId })
      .andWhere("route.deleted_at IS NULL")
      .andWhere("route.is_active = true")
      .select("route.method", "method")
      .addSelect("route.path", "path")
      .distinct(true)
      .getRawMany<PermissionRoute>();

    // 10 minutes
    await this.cacheManager.set(key, routes, 1000 * 60 * 10);
    return routes;
  }

  async getModuleLabelsForRoute(
    method: string,
    path: string,
  ): Promise<RouteModuleLabel[]> {
    return this.routeRepository
      .createQueryBuilder("route")
      .innerJoin(
        "module_route",
        "module_route",
        "module_route.route_id = route.external_id AND module_route.deleted_at IS NULL",
      )
      .innerJoin(
        "module",
        "module",
        "module.external_id = module_route.module_id AND module.deleted_at IS NULL AND module.is_active = true",
      )
      .where("route.method = :method", { method })
      .andWhere("route.path = :path", { path })
      .andWhere("route.deleted_at IS NULL")
      .andWhere("route.is_active = true")
      .select("module.name", "name")
      .distinct(true)
      .getRawMany<RouteModuleLabel>();
  }
}
