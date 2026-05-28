import { AddModuleRoutesDto } from "../dto/add-module-routes.dto";
import { ModuleRouteResponseDto } from "../dto/module-route-response.dto";
import { SyncModuleRoutesDto } from "../dto/sync-module-routes.dto";

export interface ModuleRoutesServicePort {
  listByModuleId(moduleId: string): Promise<ModuleRouteResponseDto[]>;
  sync(moduleId: string, payload: SyncModuleRoutesDto): Promise<ModuleRouteResponseDto[]>;
  add(moduleId: string, payload: AddModuleRoutesDto): Promise<ModuleRouteResponseDto[]>;
  remove(moduleId: string, routeId: string): Promise<void>;
}
