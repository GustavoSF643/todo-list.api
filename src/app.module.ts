import { Module } from "@nestjs/common";
import { ThrottlerModule, minutes, seconds } from "@nestjs/throttler";

import { AppConfigModule } from "./config/config.module";
import { CacheInfraModule } from "./infra/cache/cache.module";
import { DatabaseModule } from "./infra/database/database.module";

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
