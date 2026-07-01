import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { PaginatedResult } from "@application/common/pagination";
import type { ModuleRepositoryPort } from "@application/modules";
import { ModuleEntity } from "../entities/module.entity";

@Injectable()
export class TypeOrmModuleRepository implements ModuleRepositoryPort {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly repository: Repository<ModuleEntity>,
  ) {}

  findByExternalId(externalId: string): Promise<ModuleEntity | null> {
    return this.repository.findOne({ where: { external_id: externalId } });
  }

  findByName(name: string): Promise<ModuleEntity | null> {
    return this.repository.findOne({ where: { name } });
  }

  findByModuleKey(moduleKey: string): Promise<ModuleEntity | null> {
    return this.repository.findOne({ where: { module_key: moduleKey } });
  }

  async findAllPaginated(
    skip: number,
    take: number,
  ): Promise<PaginatedResult<ModuleEntity>> {
    const [items, total] = await this.repository.findAndCount({ skip, take });
    return { items, total };
  }

  save(moduleEntity: ModuleEntity): Promise<ModuleEntity> {
    return this.repository.save(moduleEntity);
  }

  create(data: Partial<ModuleEntity>): ModuleEntity {
    return this.repository.create(data);
  }

  merge(moduleEntity: ModuleEntity, data: Partial<ModuleEntity>): ModuleEntity {
    return this.repository.merge(moduleEntity, data);
  }

  async softDeleteByExternalId(externalId: string): Promise<boolean> {
    const result = await this.repository.softDelete({
      external_id: externalId,
    });
    return Boolean(result.affected);
  }
}
