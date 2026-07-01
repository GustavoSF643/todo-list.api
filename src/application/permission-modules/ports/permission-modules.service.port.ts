import type {
  PaginatedResponseDto,
  PaginationQueryDto,
} from "@application/common/pagination";

import { AddPermissionModulesDto } from "../dto/add-permission-modules.dto";
import { PermissionModuleResponseDto } from "../dto/permission-module-response.dto";
import { SyncPermissionModulesDto } from "../dto/sync-permission-modules.dto";

export interface PermissionModulesServicePort {
  listByPermissionId(
    permissionId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PermissionModuleResponseDto>>;
  sync(
    permissionId: string,
    payload: SyncPermissionModulesDto,
  ): Promise<PermissionModuleResponseDto[]>;
  add(
    permissionId: string,
    payload: AddPermissionModulesDto,
  ): Promise<PermissionModuleResponseDto[]>;
  remove(permissionId: string, moduleId: string): Promise<void>;
}
