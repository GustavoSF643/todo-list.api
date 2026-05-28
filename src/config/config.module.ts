import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { configs } from "./app.config";
import { AppConfigService } from "./app-config.service";
import { appConfigProvider } from "./config.provider";
import { envValidationSchema } from "./validation/env.validation";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      validate: (config) => envValidationSchema.parse(config),
    }),
  ],
  providers: [appConfigProvider, AppConfigService],
  exports: [appConfigProvider, AppConfigService],
})
export class AppConfigModule {}
