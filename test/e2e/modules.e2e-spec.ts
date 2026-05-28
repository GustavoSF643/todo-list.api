import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";

import { MODULE_SERVICE } from "@application/modules";
import { ModulesController } from "@modules/modules/modules.controller";
import { createControllerTestApp } from "../support/app/create-controller-test-app";
import { E2E_MODULE_ID } from "../support/fixtures/e2e-fixtures";
import { bearer } from "../support/http/bearer";

describe("Modules (e2e)", () => {
  let app: INestApplication<App>;
  const moduleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByExternalId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [ModulesController],
      providers: [{ provide: MODULE_SERVICE, useValue: moduleService }],
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /modules with token creates module", async () => {
    moduleService.create.mockResolvedValue({
      id: E2E_MODULE_ID,
      name: "Usuários",
      description: "Operações relacionadas ao cadastro de usuários",
      module_key: "USERS",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    const response = await request(app.getHttpServer())
      .post("/modules")
      .set(bearer())
      .send({
        name: "Usuários",
        description: "Operações relacionadas ao cadastro de usuários",
        module_key: "USERS",
        is_active: true,
      })
      .expect(201);

    expect(response.body.module_key).toBe("USERS");
    expect(moduleService.create).toHaveBeenCalledWith({
      name: "Usuários",
      description: "Operações relacionadas ao cadastro de usuários",
      module_key: "USERS",
      is_active: true,
    });
  });

  it("POST /modules without token returns 401", () => {
    return request(app.getHttpServer())
      .post("/modules")
      .send({
        name: "Usuários",
        module_key: "USERS",
      })
      .expect(401);
  });

  it("GET /modules with token returns modules list", async () => {
    moduleService.findAll.mockResolvedValue([
      {
        id: E2E_MODULE_ID,
        name: "Usuários",
        description: "Operações relacionadas ao cadastro de usuários",
        module_key: "USERS",
        is_active: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ]);

    const response = await request(app.getHttpServer())
      .get("/modules")
      .set(bearer())
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(moduleService.findAll).toHaveBeenCalledTimes(1);
  });

  it("GET /modules/:id returns module", async () => {
    moduleService.findByExternalId.mockResolvedValue({
      id: E2E_MODULE_ID,
      name: "Usuários",
      description: "Operações relacionadas ao cadastro de usuários",
      module_key: "USERS",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    const response = await request(app.getHttpServer())
      .get(`/modules/${E2E_MODULE_ID}`)
      .set(bearer())
      .expect(200);

    expect(response.body.id).toBe(E2E_MODULE_ID);
    expect(moduleService.findByExternalId).toHaveBeenCalledWith(E2E_MODULE_ID);
  });

  it("PATCH /modules/:id updates module", async () => {
    moduleService.update.mockResolvedValue({
      id: E2E_MODULE_ID,
      name: "Usuários Atualizado",
      description: "Descrição atualizada",
      module_key: "USERS",
      is_active: false,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    });

    const response = await request(app.getHttpServer())
      .patch(`/modules/${E2E_MODULE_ID}`)
      .set(bearer())
      .send({ name: "Usuários Atualizado", is_active: false })
      .expect(200);

    expect(response.body.name).toBe("Usuários Atualizado");
    expect(moduleService.update).toHaveBeenCalledWith(E2E_MODULE_ID, {
      name: "Usuários Atualizado",
      is_active: false,
    });
  });

  it("DELETE /modules/:id removes module", async () => {
    moduleService.remove.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .delete(`/modules/${E2E_MODULE_ID}`)
      .set(bearer())
      .expect(200);

    expect(moduleService.remove).toHaveBeenCalledWith(E2E_MODULE_ID);
  });
});
