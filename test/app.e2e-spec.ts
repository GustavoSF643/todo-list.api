import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import request from "supertest";
import { App } from "supertest/types";

import { PERMISSION_SERVICE } from "@application/permissions";
import { SESSION_SERVICE } from "@application/sessions";
import { USER_SERVICE } from "@application/users";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { PermissionsController } from "@modules/permissions/permissions.controller";
import { SessionsController } from "@modules/sessions/sessions.controller";
import { UsersController } from "@modules/users/users.controller";

describe("App (e2e)", () => {
  let app: INestApplication<App>;
  const userService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByExternalId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const sessionService = {
    create: jest.fn(),
  };
  const permissionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByExternalId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const testJwtAuthGuard: CanActivate = {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<Request>();
      const authorization = request.headers.authorization;
      if (!authorization) {
        throw new UnauthorizedException("Token de autenticação ausente.");
      }
      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [UsersController, SessionsController, PermissionsController],
      providers: [
        { provide: USER_SERVICE, useValue: userService },
        { provide: SESSION_SERVICE, useValue: sessionService },
        { provide: PERMISSION_SERVICE, useValue: permissionService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(testJwtAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(testJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
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

  it("POST /sessions returns token payload", async () => {
    sessionService.create.mockResolvedValue({
      user: {
        id: "11111111-1111-1111-1111-111111111111",
        permission_id: "22222222-2222-2222-2222-222222222222",
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

  it("GET /users with token returns users list", async () => {
    userService.findAll.mockResolvedValue([
      {
        id: "11111111-1111-1111-1111-111111111111",
        permission_id: "22222222-2222-2222-2222-222222222222",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      },
    ]);

    const response = await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", "Bearer token")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(userService.findAll).toHaveBeenCalledTimes(1);
  });

  it("POST /permissions with token creates permission", async () => {
    permissionService.create.mockResolvedValue({
      id: "33333333-3333-3333-3333-333333333333",
      name: "ADMIN",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    const response = await request(app.getHttpServer())
      .post("/permissions")
      .set("Authorization", "Bearer token")
      .send({ name: "ADMIN", is_active: true })
      .expect(201);

    expect(response.body.name).toBe("ADMIN");
    expect(permissionService.create).toHaveBeenCalledWith({
      name: "ADMIN",
      is_active: true,
    });
  });
});
