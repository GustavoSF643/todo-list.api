import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  PERMISSION_REPOSITORY,
  PERMISSION_SERVICE,
  PermissionService,
} from "@application/permissions";
import { PermissionEntity } from "@infra/database/entities/permission.entity";
import { TypeOrmPermissionRepository } from "@infra/database/repositories/typeorm-permission.repository";
import { AuthModule } from "@modules/auth/auth.module";

import { PermissionsController } from "./permissions.controller";

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([PermissionEntity]),
  ],
  controllers: [PermissionsController],
  providers: [
    {
      provide: PERMISSION_REPOSITORY,
      useClass: TypeOrmPermissionRepository,
    },
    {
      provide: PERMISSION_SERVICE,
      useClass: PermissionService,
    },
  ],
  exports: [PERMISSION_REPOSITORY, PERMISSION_SERVICE],
})
export class PermissionsModule {}
