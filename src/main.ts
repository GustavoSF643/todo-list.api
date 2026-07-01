import { Logger, ValidationPipe } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { RouteSyncService } from "./infra/route-sync/service/route-sync.service";

function setupSwagger(app: NestExpressApplication): void {
  const config = new DocumentBuilder()
    .setTitle(
      process.env.APP_NAME ?? "Permissions API — Auth, RBAC & Todo Lists",
    )
    .setDescription(
      "REST API com autenticação JWT, autorização por módulos/rotas (RBAC), CRUD de usuários e permissões, " +
        "todo-lists com visibilidade private/public, paginação padronizada e documentação OpenAPI. " +
        "Stack: NestJS, TypeORM, PostgreSQL, Redis (opcional).",
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      "access-token",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
}

async function bootstrap() {
  const port = process.env.PORT || 5000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.set("trust proxy", true);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const routeSync = app.get(RouteSyncService);
  await routeSync.syncRoutes();

  setupSwagger(app);
  app.useLogger(new Logger());
  await app.listen(port);
  console.log(`Application is running on: ${port} port ✅`);
  console.log(`Swagger docs: http://localhost:${port}/api`);
}
void bootstrap();
