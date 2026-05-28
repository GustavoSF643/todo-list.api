import { Module } from "@nestjs/common";
import { ThrottlerModule, minutes, seconds } from "@nestjs/throttler";

import { AppConfigModule } from "./config/config.module";
import { CacheInfraModule } from "./infra/cache/cache.module";
import { DatabaseModule } from "./infra/database/database.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { UsersModule } from "./modules/users/users.module";

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
    SessionsModule,
    PermissionsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
