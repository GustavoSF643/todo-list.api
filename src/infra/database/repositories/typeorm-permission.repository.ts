import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { PermissionRepositoryPort } from "@application/permissions";
import { PermissionEntity } from "../entities/permission.entity";

@Injectable()
export class TypeOrmPermissionRepository implements PermissionRepositoryPort {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly repository: Repository<PermissionEntity>,
  ) {}

  findByExternalId(externalId: string): Promise<PermissionEntity | null> {
    return this.repository.findOne({ where: { external_id: externalId } });
  }

  findByName(name: string): Promise<PermissionEntity | null> {
    return this.repository.findOne({ where: { name } });
  }

  findAll(): Promise<PermissionEntity[]> {
    return this.repository.find();
  }

  save(permission: PermissionEntity): Promise<PermissionEntity> {
    return this.repository.save(permission);
  }

  create(data: Partial<PermissionEntity>): PermissionEntity {
    return this.repository.create(data);
  }

  merge(
    permission: PermissionEntity,
    data: Partial<PermissionEntity>,
  ): PermissionEntity {
    return this.repository.merge(permission, data);
  }

  async softDeleteByExternalId(externalId: string): Promise<boolean> {
    const result = await this.repository.softDelete({
      external_id: externalId,
    });
    return Boolean(result.affected);
  }

  async existsByExternalId(externalId: string): Promise<boolean> {
    const permission = await this.findByExternalId(externalId);
    return permission !== null;
  }
}
