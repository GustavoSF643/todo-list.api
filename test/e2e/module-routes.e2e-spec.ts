import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";

import { MODULE_ROUTES_SERVICE } from "@application/module-routes";
import { ModuleRoutesController } from "@modules/modules/module-routes.controller";
import { createControllerTestApp } from "../support/app/create-controller-test-app";
import { E2E_MODULE_ID, E2E_ROUTE_ID } from "../support/fixtures/e2e-fixtures";
import { bearer } from "../support/http/bearer";

describe("Module routes (e2e)", () => {
  let app: INestApplication<App>;
  const moduleRoutesService = {
    listByModuleId: jest.fn(),
    sync: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [ModuleRoutesController],
      providers: [
        { provide: MODULE_ROUTES_SERVICE, useValue: moduleRoutesService },
      ],
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /modules/:id/routes returns linked routes", async () => {
    moduleRoutesService.listByModuleId.mockResolvedValue([
      {
        id: E2E_ROUTE_ID,
        method: "GET",
        path: "/users",
        is_active: true,
      },
    ]);

    const response = await request(app.getHttpServer())
      .get(`/modules/${E2E_MODULE_ID}/routes`)
      .set(bearer())
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(moduleRoutesService.listByModuleId).toHaveBeenCalledWith(
      E2E_MODULE_ID,
    );
  });

  it("PUT /modules/:id/routes syncs route links", async () => {
    moduleRoutesService.sync.mockResolvedValue([
      {
        id: E2E_ROUTE_ID,
        method: "GET",
        path: "/users",
        is_active: true,
      },
    ]);

    const response = await request(app.getHttpServer())
      .put(`/modules/${E2E_MODULE_ID}/routes`)
      .set(bearer())
      .send({ route_ids: [E2E_ROUTE_ID] })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(moduleRoutesService.sync).toHaveBeenCalledWith(E2E_MODULE_ID, {
      route_ids: [E2E_ROUTE_ID],
    });
  });

  it("POST /modules/:id/routes adds route links", async () => {
    moduleRoutesService.add.mockResolvedValue([
      {
        id: E2E_ROUTE_ID,
        method: "GET",
        path: "/users",
        is_active: true,
      },
    ]);

    await request(app.getHttpServer())
      .post(`/modules/${E2E_MODULE_ID}/routes`)
      .set(bearer())
      .send({ route_ids: [E2E_ROUTE_ID] })
      .expect(201);

    expect(moduleRoutesService.add).toHaveBeenCalledWith(E2E_MODULE_ID, {
      route_ids: [E2E_ROUTE_ID],
    });
  });

  it("DELETE /modules/:id/routes/:routeId removes link", async () => {
    moduleRoutesService.remove.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .delete(`/modules/${E2E_MODULE_ID}/routes/${E2E_ROUTE_ID}`)
      .set(bearer())
      .expect(204);

    expect(moduleRoutesService.remove).toHaveBeenCalledWith(
      E2E_MODULE_ID,
      E2E_ROUTE_ID,
    );
  });
});
