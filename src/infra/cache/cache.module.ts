import { Module } from "@nestjs/common";
import {
  CacheModule as NestCacheModule,
  type CacheModuleOptions,
} from "@nestjs/cache-manager";
import { minutes } from "@nestjs/throttler";
import { createKeyv } from "@keyv/redis";

import { AppConfigModule } from "@config/config.module";
import { AppConfigService } from "@config/app-config.service";

@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService): CacheModuleOptions => {
        const ttl = minutes(5);
        const url = appConfig.redis.url;
        if (!url) {
          return { ttl };
        }
        return {
          ttl,
          stores: [createKeyv(url)],
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheInfraModule {}
