import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ThrottlerModule, minutes, seconds } from "@nestjs/throttler";

import { AppConfigModule } from "./config/config.module";
import { DatabaseModule } from "./infra/database/database.module";

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      timeToLive: minutes(5),
    }),
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
    AppConfigModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
