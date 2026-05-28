import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, IsNull, Repository } from "typeorm";

import type { RouteQueryRepositoryPort } from "@application/module-routes";
import { RouteEntity } from "../entities/route.entity";

@Injectable()
export class TypeOrmRouteQueryRepository implements RouteQueryRepositoryPort {
  constructor(
    @InjectRepository(RouteEntity)
    private readonly repository: Repository<RouteEntity>,
  ) {}

  findActiveByExternalIds(externalIds: string[]): Promise<RouteEntity[]> {
    if (!externalIds.length) {
      return Promise.resolve([] as RouteEntity[]);
    }

    return this.repository.find({
      where: {
        external_id: In(externalIds),
        deleted_at: IsNull(),
        is_active: true,
      },
    });
  }
}
