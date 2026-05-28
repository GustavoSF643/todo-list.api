import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  PERMISSION_REPOSITORY,
  type PermissionRepositoryPort,
} from "@application/permissions";
import { AddPermissionModulesDto } from "../dto/add-permission-modules.dto";
import { PermissionModuleResponseDto } from "../dto/permission-module-response.dto";
import { SyncPermissionModulesDto } from "../dto/sync-permission-modules.dto";
import { toPermissionModuleResponseDto } from "../mappers/permission-module-response.mapper";
import type { ModuleQueryRepositoryPort } from "../ports/module-query.repository.port";
import type { PermissionModuleRepositoryPort } from "../ports/permission-module.repository.port";
import type { PermissionModulesServicePort } from "../ports/permission-modules.service.port";
import {
  MODULE_QUERY_REPOSITORY,
  PERMISSION_MODULE_REPOSITORY,
} from "../tokens/injection-tokens";

@Injectable()
export class PermissionModulesService implements PermissionModulesServicePort {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepositoryPort,
    @Inject(PERMISSION_MODULE_REPOSITORY)
    private readonly permissionModuleRepository: PermissionModuleRepositoryPort,
    @Inject(MODULE_QUERY_REPOSITORY)
    private readonly moduleQueryRepository: ModuleQueryRepositoryPort,
  ) {}

  async listByPermissionId(
    permissionId: string,
  ): Promise<PermissionModuleResponseDto[]> {
    await this.ensurePermissionExists(permissionId);
    const modules = await this.findModulesByPermissionId(permissionId);
    return modules.map((moduleEntity) =>
      toPermissionModuleResponseDto(moduleEntity),
    );
  }

  async sync(
    permissionId: string,
    payload: SyncPermissionModulesDto,
  ): Promise<PermissionModuleResponseDto[]> {
    await this.ensurePermissionExists(permissionId);
    await this.ensureModulesExist(payload.module_ids);

    await this.permissionModuleRepository.softDeleteAllByPermissionId(
      permissionId,
    );

    for (const moduleId of payload.module_ids) {
      await this.linkModule(permissionId, moduleId);
    }

    return this.listByPermissionId(permissionId);
  }

  async add(
    permissionId: string,
    payload: AddPermissionModulesDto,
  ): Promise<PermissionModuleResponseDto[]> {
    await this.ensurePermissionExists(permissionId);
    await this.ensureModulesExist(payload.module_ids);

    for (const moduleId of payload.module_ids) {
      await this.linkModule(permissionId, moduleId);
    }

    return this.listByPermissionId(permissionId);
  }

  async remove(permissionId: string, moduleId: string): Promise<void> {
    await this.ensurePermissionExists(permissionId);

    const wasDeleted =
      await this.permissionModuleRepository.softDeleteByPermissionIdAndModuleId(
        permissionId,
        moduleId,
      );

    if (!wasDeleted) {
      throw new NotFoundException(
        "Vínculo entre permissão e módulo não encontrado.",
      );
    }
  }

  private async linkModule(
    permissionId: string,
    moduleId: string,
  ): Promise<void> {
    const existing =
      await this.permissionModuleRepository.findByPermissionIdAndModuleId(
        permissionId,
        moduleId,
      );

    if (!existing) {
      const entity = this.permissionModuleRepository.create({
        permission_id: permissionId,
        module_id: moduleId,
      });
      await this.permissionModuleRepository.save(entity);
      return;
    }

    if (existing.deleted_at) {
      await this.permissionModuleRepository.restore(existing);
    }
  }

  private async findModulesByPermissionId(permissionId: string) {
    const links =
      await this.permissionModuleRepository.findActiveByPermissionId(
        permissionId,
      );
    const moduleIds = links.map((link) => link.module_id);

    if (!moduleIds.length) {
      return [];
    }

    return this.moduleQueryRepository.findActiveByExternalIds(moduleIds);
  }

  private async ensurePermissionExists(permissionId: string): Promise<void> {
    const permission =
      await this.permissionRepository.findByExternalId(permissionId);
    if (!permission) {
      throw new NotFoundException("Permissão não encontrada.");
    }
  }

  private async ensureModulesExist(moduleIds: string[]): Promise<void> {
    if (!moduleIds.length) {
      return;
    }

    const modules =
      await this.moduleQueryRepository.findActiveByExternalIds(moduleIds);

    if (modules.length !== moduleIds.length) {
      throw new BadRequestException(
        "Um ou mais módulos informados não existem ou estão inativos.",
      );
    }
  }
}
