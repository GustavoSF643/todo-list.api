import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";

import { RouteEntity } from "../entities/route.entity";
import { RouteMethodEnum } from "../enums";

export type SyncRouteInput = {
  method: RouteMethodEnum;
  path: string;
};

@Injectable()
export class TypeOrmRouteRepository {
  constructor(
    @InjectRepository(RouteEntity)
    private readonly repository: Repository<RouteEntity>,
  ) {}

  async bulkUpsert(routes: SyncRouteInput[]): Promise<InsertResult> {
    if (!routes.length) {
      return { identifiers: [], generatedMaps: [], raw: [] };
    }

    return this.repository
      .createQueryBuilder()
      .insert()
      .into(RouteEntity)
      .values(
        routes.map((route) => ({
          method: route.method,
          path: route.path,
          is_active: true,
        })),
      )
      .orIgnore()
      .execute();
  }
}
