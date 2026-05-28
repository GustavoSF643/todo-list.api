import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";

import { PERMISSION_MODULES_SERVICE } from "@application/permission-modules";
import { PERMISSION_SERVICE } from "@application/permissions";
import { PermissionModulesController } from "@modules/permissions/permission-modules.controller";
import { PermissionsController } from "@modules/permissions/permissions.controller";
import { createControllerTestApp } from "../support/app/create-controller-test-app";
import {
  E2E_MODULE_ID,
  E2E_PERMISSION_ADMIN_ID,
} from "../support/fixtures/e2e-fixtures";
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
  const permissionModulesService = {
    listByPermissionId: jest.fn(),
    sync: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [PermissionsController, PermissionModulesController],
      providers: [
        { provide: PERMISSION_SERVICE, useValue: permissionService },
        {
          provide: PERMISSION_MODULES_SERVICE,
          useValue: permissionModulesService,
        },
      ],
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

  it("GET /permissions/:id/modules returns linked modules", async () => {
    permissionModulesService.listByPermissionId.mockResolvedValue([
      {
        id: E2E_MODULE_ID,
        name: "Usuários",
        description: "Operações relacionadas ao cadastro de usuários",
        module_key: "USERS",
        is_active: true,
      },
    ]);

    const response = await request(app.getHttpServer())
      .get(`/permissions/${E2E_PERMISSION_ADMIN_ID}/modules`)
      .set(bearer())
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(permissionModulesService.listByPermissionId).toHaveBeenCalledWith(
      E2E_PERMISSION_ADMIN_ID,
    );
  });

  it("PUT /permissions/:id/modules syncs links", async () => {
    permissionModulesService.sync.mockResolvedValue([
      {
        id: E2E_MODULE_ID,
        name: "Usuários",
        module_key: "USERS",
        is_active: true,
      },
    ]);

    const response = await request(app.getHttpServer())
      .put(`/permissions/${E2E_PERMISSION_ADMIN_ID}/modules`)
      .set(bearer())
      .send({ module_ids: [E2E_MODULE_ID] })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(permissionModulesService.sync).toHaveBeenCalledWith(
      E2E_PERMISSION_ADMIN_ID,
      { module_ids: [E2E_MODULE_ID] },
    );
  });

  it("POST /permissions/:id/modules adds links", async () => {
    permissionModulesService.add.mockResolvedValue([
      {
        id: E2E_MODULE_ID,
        name: "Usuários",
        module_key: "USERS",
        is_active: true,
      },
    ]);

    await request(app.getHttpServer())
      .post(`/permissions/${E2E_PERMISSION_ADMIN_ID}/modules`)
      .set(bearer())
      .send({ module_ids: [E2E_MODULE_ID] })
      .expect(201);

    expect(permissionModulesService.add).toHaveBeenCalledWith(
      E2E_PERMISSION_ADMIN_ID,
      { module_ids: [E2E_MODULE_ID] },
    );
  });

  it("DELETE /permissions/:id/modules/:moduleId removes link", async () => {
    permissionModulesService.remove.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .delete(
        `/permissions/${E2E_PERMISSION_ADMIN_ID}/modules/${E2E_MODULE_ID}`,
      )
      .set(bearer())
      .expect(204);

    expect(permissionModulesService.remove).toHaveBeenCalledWith(
      E2E_PERMISSION_ADMIN_ID,
      E2E_MODULE_ID,
    );
  });
});
