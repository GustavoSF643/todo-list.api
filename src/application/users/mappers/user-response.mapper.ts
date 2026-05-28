import type { UserEntity } from "@infra/database/entities/user.entity";

import { UserResponseDto } from "../dto/user-response.dto";

export const toUserResponseDto = (user: UserEntity): UserResponseDto => ({
  id: user.external_id,
  permission_id: user.permission_id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  two_factor_is_enabled: user.two_factor_is_enabled,
  is_active: user.is_active,
  created_at: user.created_at,
  updated_at: user.updated_at,
});
