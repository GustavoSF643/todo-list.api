import type { ModuleEntity } from "@infra/database/entities/module.entity";

export interface ModuleRepositoryPort {
  findByExternalId(externalId: string): Promise<ModuleEntity | null>;
  findByName(name: string): Promise<ModuleEntity | null>;
  findByModuleKey(moduleKey: string): Promise<ModuleEntity | null>;
  findAll(): Promise<ModuleEntity[]>;
  save(moduleEntity: ModuleEntity): Promise<ModuleEntity>;
  create(data: Partial<ModuleEntity>): ModuleEntity;
  merge(moduleEntity: ModuleEntity, data: Partial<ModuleEntity>): ModuleEntity;
  softDeleteByExternalId(externalId: string): Promise<boolean>;
}
