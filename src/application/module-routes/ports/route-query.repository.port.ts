import type { RouteEntity } from "@infra/database/entities/route.entity";

export interface RouteQueryRepositoryPort {
  findActiveByExternalIds(externalIds: string[]): Promise<RouteEntity[]>;
}
