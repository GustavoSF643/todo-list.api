import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";

import { USER_SERVICE } from "@application/users";
import { UsersController } from "@modules/users/users.controller";
import { createControllerTestApp } from "../support/app/create-controller-test-app";
import { E2E_PERMISSION_ID, E2E_USER_ID } from "../support/fixtures/e2e-fixtures";
import { bearer } from "../support/http/bearer";

describe("Users (e2e)", () => {
  let app: INestApplication<App>;
  const userService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByExternalId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [UsersController],
      providers: [{ provide: USER_SERVICE, useValue: userService }],
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /users without token returns 401", () => {
    return request(app.getHttpServer()).get("/users").expect(401);
  });

  it("GET /users with token returns users list", async () => {
    userService.findAll.mockResolvedValue([
      {
        id: E2E_USER_ID,
        permission_id: E2E_PERMISSION_ID,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      },
    ]);

    const response = await request(app.getHttpServer())
      .get("/users")
      .set(bearer())
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(userService.findAll).toHaveBeenCalledTimes(1);
  });

  it("POST /users is public and creates user", async () => {
    userService.create.mockResolvedValue({
      id: E2E_USER_ID,
      permission_id: E2E_PERMISSION_ID,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
    });

    const response = await request(app.getHttpServer())
      .post("/users")
      .send({
        permission_id: E2E_PERMISSION_ID,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "SenhaSegura123!",
      })
      .expect(201);

    expect(response.body.email).toBe("john@example.com");
    expect(userService.create).toHaveBeenCalled();
  });

  it("POST /users with invalid payload returns 400", () => {
    return request(app.getHttpServer())
      .post("/users")
      .send({ email: "not-an-email" })
      .expect(400);
  });

  it("GET /users/:id returns user", async () => {
    userService.findByExternalId.mockResolvedValue({
      id: E2E_USER_ID,
      permission_id: E2E_PERMISSION_ID,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
    });

    const response = await request(app.getHttpServer())
      .get(`/users/${E2E_USER_ID}`)
      .set(bearer())
      .expect(200);

    expect(response.body.id).toBe(E2E_USER_ID);
    expect(userService.findByExternalId).toHaveBeenCalledWith(E2E_USER_ID);
  });

  it("PATCH /users/:id updates user", async () => {
    userService.update.mockResolvedValue({
      id: E2E_USER_ID,
      permission_id: E2E_PERMISSION_ID,
      first_name: "Jane",
      last_name: "Doe",
      email: "john@example.com",
    });

    const response = await request(app.getHttpServer())
      .patch(`/users/${E2E_USER_ID}`)
      .set(bearer())
      .send({ first_name: "Jane" })
      .expect(200);

    expect(response.body.first_name).toBe("Jane");
    expect(userService.update).toHaveBeenCalledWith(E2E_USER_ID, {
      first_name: "Jane",
    });
  });

  it("DELETE /users/:id removes user", async () => {
    userService.remove.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .delete(`/users/${E2E_USER_ID}`)
      .set(bearer())
      .expect(200);

    expect(userService.remove).toHaveBeenCalledWith(E2E_USER_ID);
  });
});
