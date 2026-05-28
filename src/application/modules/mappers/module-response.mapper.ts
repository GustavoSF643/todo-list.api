import type { ModuleEntity } from "@infra/database/entities/module.entity";

import { ModuleResponseDto } from "../dto/module-response.dto";

export const toModuleResponseDto = (
  moduleEntity: ModuleEntity,
): ModuleResponseDto => ({
  id: moduleEntity.external_id,
  name: moduleEntity.name,
  description: moduleEntity.description,
  module_key: moduleEntity.module_key,
  is_active: moduleEntity.is_active,
  created_at: moduleEntity.created_at,
  updated_at: moduleEntity.updated_at,
});
