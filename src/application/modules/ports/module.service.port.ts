import { CreateModuleDto } from "../dto/create-module.dto";
import { ModuleResponseDto } from "../dto/module-response.dto";
import { UpdateModuleDto } from "../dto/update-module.dto";

export interface ModuleServicePort {
  create(payload: CreateModuleDto): Promise<ModuleResponseDto>;
  findAll(): Promise<ModuleResponseDto[]>;
  findByExternalId(externalId: string): Promise<ModuleResponseDto>;
  update(
    externalId: string,
    payload: UpdateModuleDto,
  ): Promise<ModuleResponseDto>;
  remove(externalId: string): Promise<void>;
}
