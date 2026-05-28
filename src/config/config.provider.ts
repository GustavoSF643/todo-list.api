import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "./app.config";

export const APP_CONFIG = "APP_CONFIG";

export const appConfigProvider: Provider = {
  provide: APP_CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): AppConfig =>
    configService.getOrThrow<AppConfig>("appConfig"),
};
