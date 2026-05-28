import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  MODULE_ROUTE_REPOSITORY,
  MODULE_ROUTES_SERVICE,
  ModuleRoutesService,
  ROUTE_QUERY_REPOSITORY,
} from "@application/module-routes";
import {
  MODULE_REPOSITORY,
  MODULE_SERVICE,
  ModuleService,
} from "@application/modules";
import { ModuleRouteEntity } from "@infra/database/entities/module-route.entity";
import { ModuleEntity } from "@infra/database/entities/module.entity";
import { RouteEntity } from "@infra/database/entities/route.entity";
import { TypeOrmModuleRouteRepository } from "@infra/database/repositories/typeorm-module-route.repository";
import { TypeOrmModuleRepository } from "@infra/database/repositories/typeorm-module.repository";
import { TypeOrmRouteQueryRepository } from "@infra/database/repositories/typeorm-route-query.repository";
import { AuthModule } from "@modules/auth/auth.module";
import { ModuleRoutesController } from "./module-routes.controller";
import { ModulesController } from "./modules.controller";

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([ModuleEntity, ModuleRouteEntity, RouteEntity]),
  ],
  controllers: [ModulesController, ModuleRoutesController],
  providers: [
    {
      provide: MODULE_REPOSITORY,
      useClass: TypeOrmModuleRepository,
    },
    {
      provide: MODULE_SERVICE,
      useClass: ModuleService,
    },
    {
      provide: MODULE_ROUTE_REPOSITORY,
      useClass: TypeOrmModuleRouteRepository,
    },
    {
      provide: ROUTE_QUERY_REPOSITORY,
      useClass: TypeOrmRouteQueryRepository,
    },
    {
      provide: MODULE_ROUTES_SERVICE,
      useClass: ModuleRoutesService,
    },
  ],
  exports: [MODULE_REPOSITORY, MODULE_SERVICE, MODULE_ROUTES_SERVICE],
})
export class ModulesModule {}
