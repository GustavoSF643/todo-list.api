import type { ModuleEntity } from "@infra/database/entities/module.entity";

import { PermissionModuleResponseDto } from "../dto/permission-module-response.dto";

export const toPermissionModuleResponseDto = (
  moduleEntity: ModuleEntity,
): PermissionModuleResponseDto => ({
  id: moduleEntity.external_id,
  name: moduleEntity.name,
  description: moduleEntity.description,
  module_key: moduleEntity.module_key,
  is_active: moduleEntity.is_active,
});
