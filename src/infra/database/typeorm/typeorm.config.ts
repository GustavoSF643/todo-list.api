import type { TypeOrmModuleOptions } from "@nestjs/typeorm";

import type { AppConfigService } from "../../../config/app-config.service";

export const typeOrmConfigFactory = (
  appConfigService: AppConfigService,
): TypeOrmModuleOptions => ({
  type: "postgres",
  host: appConfigService.database.host,
  port: appConfigService.database.port,
  username: appConfigService.database.user,
  password: appConfigService.database.password,
  database: appConfigService.database.database,
  ssl: appConfigService.database.ssl,
  entities: [__dirname + "/entities/*{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: false,
  logging: true,
});
