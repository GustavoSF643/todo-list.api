import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";

import { SESSION_SERVICE } from "@application/sessions";
import { SessionsController } from "@modules/sessions/sessions.controller";
import { createControllerTestApp } from "../support/app/create-controller-test-app";
import {
  E2E_PERMISSION_ID,
  E2E_USER_ID,
} from "../support/fixtures/e2e-fixtures";

describe("Sessions (e2e)", () => {
  let app: INestApplication<App>;
  const sessionService = {
    create: jest.fn(),
  };

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [SessionsController],
      providers: [{ provide: SESSION_SERVICE, useValue: sessionService }],
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /sessions returns token payload", async () => {
    sessionService.create.mockResolvedValue({
      user: {
        id: E2E_USER_ID,
        permission_id: E2E_PERMISSION_ID,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      },
      access_token: "jwt-token",
      token_type: "Bearer",
      expires_in: 3600,
    });

    const response = await request(app.getHttpServer())
      .post("/sessions")
      .send({ email: "john@example.com", password: "SenhaSegura123!" })
      .expect(201);

    expect(response.body.access_token).toBe("jwt-token");
    expect(sessionService.create).toHaveBeenCalledWith({
      email: "john@example.com",
      password: "SenhaSegura123!",
    });
  });
});
