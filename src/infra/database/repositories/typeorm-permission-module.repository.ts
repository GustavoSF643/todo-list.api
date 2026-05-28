import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";

import type { PermissionModuleRepositoryPort } from "@application/permission-modules";
import { PermissionModuleEntity } from "../entities/permission-module.entity";

@Injectable()
export class TypeOrmPermissionModuleRepository
  implements PermissionModuleRepositoryPort
{
  constructor(
    @InjectRepository(PermissionModuleEntity)
    private readonly repository: Repository<PermissionModuleEntity>,
  ) {}

  findActiveByPermissionId(
    permissionId: string,
  ): Promise<PermissionModuleEntity[]> {
    return this.repository.find({
      where: { permission_id: permissionId, deleted_at: IsNull() },
    });
  }

  findByPermissionIdAndModuleId(
    permissionId: string,
    moduleId: string,
  ): Promise<PermissionModuleEntity | null> {
    return this.repository.findOne({
      where: { permission_id: permissionId, module_id: moduleId },
      withDeleted: true,
    });
  }

  create(data: Partial<PermissionModuleEntity>): PermissionModuleEntity {
    return this.repository.create(data);
  }

  save(entity: PermissionModuleEntity): Promise<PermissionModuleEntity> {
    return this.repository.save(entity);
  }

  async softDeleteAllByPermissionId(permissionId: string): Promise<void> {
    await this.repository.softDelete({
      permission_id: permissionId,
      deleted_at: IsNull(),
    });
  }

  async softDeleteByPermissionIdAndModuleId(
    permissionId: string,
    moduleId: string,
  ): Promise<boolean> {
    const result = await this.repository.softDelete({
      permission_id: permissionId,
      module_id: moduleId,
      deleted_at: IsNull(),
    });
    return Boolean(result.affected);
  }

  async restore(
    entity: PermissionModuleEntity,
  ): Promise<PermissionModuleEntity> {
    await this.repository.restore({ id: entity.id });
    entity.deleted_at = undefined;
    return entity;
  }
}
