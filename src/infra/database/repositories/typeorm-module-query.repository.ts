import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, IsNull, Repository } from "typeorm";

import type { ModuleQueryRepositoryPort } from "@application/permission-modules";
import { ModuleEntity } from "../entities/module.entity";

@Injectable()
export class TypeOrmModuleQueryRepository implements ModuleQueryRepositoryPort {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly repository: Repository<ModuleEntity>,
  ) {}

  findActiveByExternalIds(externalIds: string[]): Promise<ModuleEntity[]> {
    if (!externalIds.length) {
      return Promise.resolve([] as ModuleEntity[]);
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
