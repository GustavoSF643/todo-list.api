export { CreateModuleDto } from "./dto/create-module.dto";
export { UpdateModuleDto } from "./dto/update-module.dto";
export { ModuleResponseDto } from "./dto/module-response.dto";

export type { ModuleRepositoryPort } from "./ports/module.repository.port";
export type { ModuleServicePort } from "./ports/module.service.port";

export { toModuleResponseDto } from "./mappers/module-response.mapper";
export { ModuleService } from "./services/module.service";

export { MODULE_REPOSITORY, MODULE_SERVICE } from "./tokens/injection-tokens";
