import { CreatePermissionDto } from "../dto/create-permission.dto";
import { PermissionResponseDto } from "../dto/permission-response.dto";
import { UpdatePermissionDto } from "../dto/update-permission.dto";

export interface PermissionServicePort {
  create(payload: CreatePermissionDto): Promise<PermissionResponseDto>;
  findAll(): Promise<PermissionResponseDto[]>;
  findByExternalId(externalId: string): Promise<PermissionResponseDto>;
  update(
    externalId: string,
    payload: UpdatePermissionDto,
  ): Promise<PermissionResponseDto>;
  remove(externalId: string): Promise<void>;
}
