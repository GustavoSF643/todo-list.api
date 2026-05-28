import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RouteEntity } from "@infra/database/entities/route.entity";
import { TypeOrmRouteRepository } from "@infra/database/repositories/typeorm-route.repository";
import { RouteSyncService } from "./service/route-sync.service";

@Module({
  imports: [DiscoveryModule, TypeOrmModule.forFeature([RouteEntity])],
  providers: [TypeOrmRouteRepository, RouteSyncService],
  exports: [RouteSyncService],
})
export class RouteSyncModule {}
