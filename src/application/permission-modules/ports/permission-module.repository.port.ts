import type { PaginatedResult } from "@application/common/pagination";
import type { PermissionModuleEntity } from "@infra/database/entities/permission-module.entity";

export interface PermissionModuleRepositoryPort {
  findActiveByPermissionId(
    permissionId: string,
  ): Promise<PermissionModuleEntity[]>;
  findActiveByPermissionIdPaginated(
    permissionId: string,
    skip: number,
    take: number,
  ): Promise<PaginatedResult<PermissionModuleEntity>>;
  findByPermissionIdAndModuleId(
    permissionId: string,
    moduleId: string,
  ): Promise<PermissionModuleEntity | null>;
  create(data: Partial<PermissionModuleEntity>): PermissionModuleEntity;
  save(entity: PermissionModuleEntity): Promise<PermissionModuleEntity>;
  softDeleteAllByPermissionId(permissionId: string): Promise<void>;
  softDeleteByPermissionIdAndModuleId(
    permissionId: string,
    moduleId: string,
  ): Promise<boolean>;
  restore(entity: PermissionModuleEntity): Promise<PermissionModuleEntity>;
}
