import type {
  PaginatedResponseDto,
  PaginationQueryDto,
} from "@application/common/pagination";

import { CreateModuleDto } from "../dto/create-module.dto";
import { ModuleResponseDto } from "../dto/module-response.dto";
import { UpdateModuleDto } from "../dto/update-module.dto";

export interface ModuleServicePort {
  create(payload: CreateModuleDto): Promise<ModuleResponseDto>;
  findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ModuleResponseDto>>;
  findByExternalId(externalId: string): Promise<ModuleResponseDto>;
  update(
    externalId: string,
    payload: UpdateModuleDto,
  ): Promise<ModuleResponseDto>;
  remove(externalId: string): Promise<void>;
}
