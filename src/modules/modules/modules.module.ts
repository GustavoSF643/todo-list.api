import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  MODULE_REPOSITORY,
  MODULE_SERVICE,
  ModuleService,
} from "@application/modules";
import { ModuleEntity } from "@infra/database/entities/module.entity";
import { TypeOrmModuleRepository } from "@infra/database/repositories/typeorm-module.repository";
import { AuthModule } from "@modules/auth/auth.module";
import { ModulesController } from "./modules.controller";

@Module({
  imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([ModuleEntity])],
  controllers: [ModulesController],
  providers: [
    {
      provide: MODULE_REPOSITORY,
      useClass: TypeOrmModuleRepository,
    },
    {
      provide: MODULE_SERVICE,
      useClass: ModuleService,
    },
  ],
  exports: [MODULE_REPOSITORY, MODULE_SERVICE],
})
export class ModulesModule {}
