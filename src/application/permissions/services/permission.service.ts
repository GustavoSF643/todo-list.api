import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { CreatePermissionDto } from "../dto/create-permission.dto";
import { PermissionResponseDto } from "../dto/permission-response.dto";
import { UpdatePermissionDto } from "../dto/update-permission.dto";
import { toPermissionResponseDto } from "../mappers/permission-response.mapper";
import type { PermissionRepositoryPort } from "../ports/permission.repository.port";
import type { PermissionServicePort } from "../ports/permission.service.port";
import { PERMISSION_REPOSITORY } from "../tokens/injection-tokens";

@Injectable()
export class PermissionService implements PermissionServicePort {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepositoryPort,
  ) {}

  async create(payload: CreatePermissionDto): Promise<PermissionResponseDto> {
    await this.ensureNameIsUnique(payload.name);

    const permission = this.permissionRepository.create(payload);
    const createdPermission = await this.permissionRepository.save(permission);
    return toPermissionResponseDto(createdPermission);
  }

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.findAll();
    return permissions.map((permission) => toPermissionResponseDto(permission));
  }

  async findByExternalId(externalId: string): Promise<PermissionResponseDto> {
    const permission =
      await this.permissionRepository.findByExternalId(externalId);

    if (!permission) {
      throw new NotFoundException("Permissão não encontrada.");
    }

    return toPermissionResponseDto(permission);
  }

  async update(
    externalId: string,
    payload: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission =
      await this.permissionRepository.findByExternalId(externalId);

    if (!permission) {
      throw new NotFoundException("Permissão não encontrada.");
    }

    if (payload.name && payload.name !== permission.name) {
      await this.ensureNameIsUnique(payload.name);
    }

    const entityToSave = this.permissionRepository.merge(permission, payload);
    const updatedPermission =
      await this.permissionRepository.save(entityToSave);
    return toPermissionResponseDto(updatedPermission);
  }

  async remove(externalId: string): Promise<void> {
    const wasDeleted =
      await this.permissionRepository.softDeleteByExternalId(externalId);

    if (!wasDeleted) {
      throw new NotFoundException("Permissão não encontrada.");
    }
  }

  private async ensureNameIsUnique(name: string): Promise<void> {
    const permissionWithSameName =
      await this.permissionRepository.findByName(name);

    if (permissionWithSameName) {
      throw new ConflictException("Já existe permissão com este nome.");
    }
  }
}
