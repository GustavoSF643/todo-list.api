import type { PermissionEntity } from "@infra/database/entities/permission.entity";

import { PermissionResponseDto } from "../dto/permission-response.dto";

export const toPermissionResponseDto = (
  permission: PermissionEntity,
): PermissionResponseDto => ({
  id: permission.external_id,
  name: permission.name,
  is_active: permission.is_active,
  is_super_admin: permission.is_super_admin,
  created_at: permission.created_at,
  updated_at: permission.updated_at,
});
