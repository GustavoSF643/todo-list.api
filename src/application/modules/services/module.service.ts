import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  parsePaginationQuery,
  toPaginatedResponse,
  type PaginationQueryDto,
} from "@application/common/pagination";

import { CreateModuleDto } from "../dto/create-module.dto";
import { ModuleResponseDto } from "../dto/module-response.dto";
import { UpdateModuleDto } from "../dto/update-module.dto";
import { toModuleResponseDto } from "../mappers/module-response.mapper";
import type { ModuleRepositoryPort } from "../ports/module.repository.port";
import type { ModuleServicePort } from "../ports/module.service.port";
import { MODULE_REPOSITORY } from "../tokens/injection-tokens";

@Injectable()
export class ModuleService implements ModuleServicePort {
  constructor(
    @Inject(MODULE_REPOSITORY)
    private readonly moduleRepository: ModuleRepositoryPort,
  ) {}

  async create(payload: CreateModuleDto): Promise<ModuleResponseDto> {
    await this.ensureNameIsUnique(payload.name);
    await this.ensureModuleKeyIsUnique(payload.module_key);

    const moduleEntity = this.moduleRepository.create(payload);
    const createdModule = await this.moduleRepository.save(moduleEntity);
    return toModuleResponseDto(createdModule);
  }

  async findAll(query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query);
    const { items, total } = await this.moduleRepository.findAllPaginated(
      pagination.skip,
      pagination.take,
    );
    return toPaginatedResponse(
      items.map((moduleEntity) => toModuleResponseDto(moduleEntity)),
      total,
      pagination,
    );
  }

  async findByExternalId(externalId: string): Promise<ModuleResponseDto> {
    const moduleEntity =
      await this.moduleRepository.findByExternalId(externalId);

    if (!moduleEntity) {
      throw new NotFoundException("Módulo não encontrado.");
    }

    return toModuleResponseDto(moduleEntity);
  }

  async update(
    externalId: string,
    payload: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    const moduleEntity =
      await this.moduleRepository.findByExternalId(externalId);

    if (!moduleEntity) {
      throw new NotFoundException("Módulo não encontrado.");
    }

    if (payload.name && payload.name !== moduleEntity.name) {
      await this.ensureNameIsUnique(payload.name);
    }

    if (payload.module_key && payload.module_key !== moduleEntity.module_key) {
      await this.ensureModuleKeyIsUnique(payload.module_key);
    }

    const entityToSave = this.moduleRepository.merge(moduleEntity, payload);
    const updatedModule = await this.moduleRepository.save(entityToSave);
    return toModuleResponseDto(updatedModule);
  }

  async remove(externalId: string): Promise<void> {
    const wasDeleted =
      await this.moduleRepository.softDeleteByExternalId(externalId);

    if (!wasDeleted) {
      throw new NotFoundException("Módulo não encontrado.");
    }
  }

  private async ensureNameIsUnique(name: string): Promise<void> {
    const existingModule = await this.moduleRepository.findByName(name);
    if (existingModule) {
      throw new ConflictException("Já existe módulo com este nome.");
    }
  }

  private async ensureModuleKeyIsUnique(moduleKey: string): Promise<void> {
    const existingModule =
      await this.moduleRepository.findByModuleKey(moduleKey);
    if (existingModule) {
      throw new ConflictException("Já existe módulo com esta chave.");
    }
  }
}
