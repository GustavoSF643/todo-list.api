import type { ModuleRouteEntity } from "@infra/database/entities/module-route.entity";

export interface ModuleRouteRepositoryPort {
  findActiveByModuleId(moduleId: string): Promise<ModuleRouteEntity[]>;
  findByModuleIdAndRouteId(
    moduleId: string,
    routeId: string,
  ): Promise<ModuleRouteEntity | null>;
  create(data: Partial<ModuleRouteEntity>): ModuleRouteEntity;
  save(entity: ModuleRouteEntity): Promise<ModuleRouteEntity>;
  softDeleteAllByModuleId(moduleId: string): Promise<void>;
  softDeleteByModuleIdAndRouteId(
    moduleId: string,
    routeId: string,
  ): Promise<boolean>;
  restore(entity: ModuleRouteEntity): Promise<ModuleRouteEntity>;
}
