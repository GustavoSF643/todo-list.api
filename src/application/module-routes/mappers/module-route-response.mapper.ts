import type { RouteEntity } from "@infra/database/entities/route.entity";

import { ModuleRouteResponseDto } from "../dto/module-route-response.dto";

export const toModuleRouteResponseDto = (
  route: RouteEntity,
): ModuleRouteResponseDto => ({
  id: route.external_id,
  method: route.method,
  path: route.path,
  is_active: route.is_active,
});
