import { INestApplication, Provider, Type, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { App } from "supertest/types";

import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { allowPermissionsGuard, testJwtAuthGuard } from "../guards/e2e-guards";

export type CreateControllerTestAppOptions = {
  controllers: Type[];
  providers: Provider[];
};

export async function createControllerTestApp(
  options: CreateControllerTestAppOptions,
): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    controllers: options.controllers,
    providers: options.providers,
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(testJwtAuthGuard)
    .overrideGuard(PermissionsGuard)
    .useValue(allowPermissionsGuard)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();
  return app;
}
