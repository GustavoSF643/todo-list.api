import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppConfigService } from "../../config/app-config.service";
import { typeOrmConfigFactory } from "./typeorm/typeorm.config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: typeOrmConfigFactory,
    }),
  ],
})
export class DatabaseModule {}
