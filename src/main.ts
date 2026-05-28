import { Logger } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const port = process.env.PORT || 5000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.set("trust proxy", true);

  app.useLogger(new Logger());
  await app.listen(port);
  console.log(`Application is running on: ${port} port ✅`);
}
void bootstrap();
