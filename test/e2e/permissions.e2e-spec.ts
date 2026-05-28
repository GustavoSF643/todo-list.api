import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";

import { PERMISSION_SERVICE } from "@application/permissions";
import { PermissionsController } from "@modules/permissions/permissions.controller";
import { createControllerTestApp } from "../support/app/create-controller-test-app";
import { E2E_PERMISSION_ADMIN_ID } from "../support/fixtures/e2e-fixtures";
import { bearer } from "../support/http/bearer";

describe("Permissions (e2e)", () => {
  let app: INestApplication<App>;
  const permissionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByExternalId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [PermissionsController],
      providers: [{ provide: PERMISSION_SERVICE, useValue: permissionService }],
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /permissions with token creates permission", async () => {
    permissionService.create.mockResolvedValue({
      id: E2E_PERMISSION_ADMIN_ID,
      name: "ADMIN",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    const response = await request(app.getHttpServer())
      .post("/permissions")
      .set(bearer())
      .send({ name: "ADMIN", is_active: true })
      .expect(201);

    expect(response.body.name).toBe("ADMIN");
    expect(permissionService.create).toHaveBeenCalledWith({
      name: "ADMIN",
      is_active: true,
    });
  });

  it("GET /permissions without token returns 401", () => {
    return request(app.getHttpServer()).get("/permissions").expect(401);
  });
});
