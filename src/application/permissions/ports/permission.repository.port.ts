import type { PermissionEntity } from "@infra/database/entities/permission.entity";

export interface PermissionRepositoryPort {
  findByExternalId(externalId: string): Promise<PermissionEntity | null>;
  findByName(name: string): Promise<PermissionEntity | null>;
  findAll(): Promise<PermissionEntity[]>;
  save(permission: PermissionEntity): Promise<PermissionEntity>;
  create(data: Partial<PermissionEntity>): PermissionEntity;
  merge(
    permission: PermissionEntity,
    data: Partial<PermissionEntity>,
  ): PermissionEntity;
  softDeleteByExternalId(externalId: string): Promise<boolean>;
  existsByExternalId(externalId: string): Promise<boolean>;
}
