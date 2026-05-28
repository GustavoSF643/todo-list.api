import { Inject, Injectable } from "@nestjs/common";

import { APP_CONFIG } from "./config.provider";
import type { AppConfig } from "./app.config";

@Injectable()
export class AppConfigService {
  constructor(
    @Inject(APP_CONFIG)
    private readonly config: AppConfig,
  ) {}

  get all(): AppConfig {
    return this.config;
  }

  get app() {
    return this.config.app;
  }

  get auth() {
    return this.config.auth;
  }

  get database() {
    return this.config.database;
  }
}
