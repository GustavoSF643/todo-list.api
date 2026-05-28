import { Module } from "@nestjs/common";
import { ThrottlerModule, minutes, seconds } from "@nestjs/throttler";

import { AppConfigModule } from "./config/config.module";
import { CacheInfraModule } from "./infra/cache/cache.module";
import { DatabaseModule } from "./infra/database/database.module";
import { RouteSyncModule } from "./infra/route-sync/route-sync.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { UsersModule } from "./modules/users/users.module";
import { ModulesModule } from "./modules/modules/modules.module";

@Module({
  imports: [
    AppConfigModule,
    CacheInfraModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: minutes(1),
          limit: 20,
          blockDuration: seconds(10),
        },
      ],
      errorMessage: "Too Many Requests",
    }),
    DatabaseModule,
    RouteSyncModule,
    SessionsModule,
    PermissionsModule,
    UsersModule,
    ModulesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
