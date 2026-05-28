import type { ModuleEntity } from "@infra/database/entities/module.entity";

export interface ModuleQueryRepositoryPort {
  findActiveByExternalIds(externalIds: string[]): Promise<ModuleEntity[]>;
}
