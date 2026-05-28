import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";

import type { ModuleRouteRepositoryPort } from "@application/module-routes";
import { ModuleRouteEntity } from "../entities/module-route.entity";

@Injectable()
export class TypeOrmModuleRouteRepository implements ModuleRouteRepositoryPort {
  constructor(
    @InjectRepository(ModuleRouteEntity)
    private readonly repository: Repository<ModuleRouteEntity>,
  ) {}

  findActiveByModuleId(moduleId: string): Promise<ModuleRouteEntity[]> {
    return this.repository.find({
      where: { module_id: moduleId, deleted_at: IsNull() },
    });
  }

  findByModuleIdAndRouteId(
    moduleId: string,
    routeId: string,
  ): Promise<ModuleRouteEntity | null> {
    return this.repository.findOne({
      where: { module_id: moduleId, route_id: routeId },
      withDeleted: true,
    });
  }

  create(data: Partial<ModuleRouteEntity>): ModuleRouteEntity {
    return this.repository.create(data);
  }

  save(entity: ModuleRouteEntity): Promise<ModuleRouteEntity> {
    return this.repository.save(entity);
  }

  async softDeleteAllByModuleId(moduleId: string): Promise<void> {
    await this.repository.softDelete({
      module_id: moduleId,
      deleted_at: IsNull(),
    });
  }

  async softDeleteByModuleIdAndRouteId(
    moduleId: string,
    routeId: string,
  ): Promise<boolean> {
    const result = await this.repository.softDelete({
      module_id: moduleId,
      route_id: routeId,
      deleted_at: IsNull(),
    });
    return Boolean(result.affected);
  }

  async restore(entity: ModuleRouteEntity): Promise<ModuleRouteEntity> {
    await this.repository.restore({ id: entity.id });
    entity.deleted_at = undefined;
    return entity;
  }
}
