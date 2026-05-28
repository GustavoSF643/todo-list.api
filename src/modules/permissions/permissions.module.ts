import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  MODULE_QUERY_REPOSITORY,
  PERMISSION_MODULE_REPOSITORY,
  PERMISSION_MODULES_SERVICE,
  PermissionModulesService,
} from "@application/permission-modules";
import {
  PERMISSION_REPOSITORY,
  PERMISSION_SERVICE,
  PermissionService,
} from "@application/permissions";
import { ModuleEntity } from "@infra/database/entities/module.entity";
import { PermissionModuleEntity } from "@infra/database/entities/permission-module.entity";
import { PermissionEntity } from "@infra/database/entities/permission.entity";
import { TypeOrmModuleQueryRepository } from "@infra/database/repositories/typeorm-module-query.repository";
import { TypeOrmPermissionModuleRepository } from "@infra/database/repositories/typeorm-permission-module.repository";
import { TypeOrmPermissionRepository } from "@infra/database/repositories/typeorm-permission.repository";
import { AuthModule } from "@modules/auth/auth.module";

import { PermissionModulesController } from "./permission-modules.controller";
import { PermissionsController } from "./permissions.controller";

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([PermissionEntity, PermissionModuleEntity, ModuleEntity]),
  ],
  controllers: [PermissionsController, PermissionModulesController],
  providers: [
    {
      provide: PERMISSION_REPOSITORY,
      useClass: TypeOrmPermissionRepository,
    },
    {
      provide: PERMISSION_SERVICE,
      useClass: PermissionService,
    },
    {
      provide: PERMISSION_MODULE_REPOSITORY,
      useClass: TypeOrmPermissionModuleRepository,
    },
    {
      provide: MODULE_QUERY_REPOSITORY,
      useClass: TypeOrmModuleQueryRepository,
    },
    {
      provide: PERMISSION_MODULES_SERVICE,
      useClass: PermissionModulesService,
    },
  ],
  exports: [PERMISSION_REPOSITORY, PERMISSION_SERVICE, PERMISSION_MODULES_SERVICE],
})
export class PermissionsModule {}
