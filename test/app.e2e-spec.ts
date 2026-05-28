import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import request from "supertest";
import { App } from "supertest/types";

import type { JwtPayload } from "@application/auth";
import { PERMISSION_SERVICE } from "@application/permissions";
import { SESSION_SERVICE } from "@application/sessions";
import { USER_SERVICE } from "@application/users";
import { IS_PUBLIC_KEY } from "@modules/auth/decorators/public.decorator";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";
import { PermissionsController } from "@modules/permissions/permissions.controller";
import { SessionsController } from "@modules/sessions/sessions.controller";
import { UsersController } from "@modules/users/users.controller";

const PERMISSION_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "11111111-1111-4111-8111-111111111111";

const reflector = new Reflector();

const testJwtAuthGuard: CanActivate = {
  canActivate(context: ExecutionContext): boolean {
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token de autenticação ausente.");
    }

    req["user"] = {
      sub: USER_ID,
      email: "john@example.com",
      permission_id: PERMISSION_ID,
    } satisfies JwtPayload;

    return true;
  },
};

const allowPermissionsGuard: CanActivate = {
  canActivate: () => true,
};

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
      .useValue(allowPermissionsGuard)
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

  describe("authentication", () => {
    it("GET /users without token returns 401", () => {
      return request(app.getHttpServer()).get("/users").expect(401);
    });

    it("GET /users with token returns users list", async () => {
      userService.findAll.mockResolvedValue([
        {
          id: USER_ID,
          permission_id: PERMISSION_ID,
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
  });

  describe("users", () => {
    it("POST /users is public and creates user", async () => {
      userService.create.mockResolvedValue({
        id: USER_ID,
        permission_id: PERMISSION_ID,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      });

      const response = await request(app.getHttpServer())
        .post("/users")
        .send({
          permission_id: PERMISSION_ID,
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
        id: USER_ID,
        permission_id: PERMISSION_ID,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      });

      const response = await request(app.getHttpServer())
        .get(`/users/${USER_ID}`)
        .set("Authorization", "Bearer token")
        .expect(200);

      expect(response.body.id).toBe(USER_ID);
      expect(userService.findByExternalId).toHaveBeenCalledWith(USER_ID);
    });

    it("PATCH /users/:id updates user", async () => {
      userService.update.mockResolvedValue({
        id: USER_ID,
        permission_id: PERMISSION_ID,
        first_name: "Jane",
        last_name: "Doe",
        email: "john@example.com",
      });

      const response = await request(app.getHttpServer())
        .patch(`/users/${USER_ID}`)
        .set("Authorization", "Bearer token")
        .send({ first_name: "Jane" })
        .expect(200);

      expect(response.body.first_name).toBe("Jane");
      expect(userService.update).toHaveBeenCalledWith(USER_ID, {
        first_name: "Jane",
      });
    });

    it("DELETE /users/:id removes user", async () => {
      userService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/users/${USER_ID}`)
        .set("Authorization", "Bearer token")
        .expect(200);

      expect(userService.remove).toHaveBeenCalledWith(USER_ID);
    });
  });

  describe("sessions", () => {
    it("POST /sessions returns token payload", async () => {
      sessionService.create.mockResolvedValue({
        user: {
          id: USER_ID,
          permission_id: PERMISSION_ID,
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

  describe("permissions", () => {
    it("POST /permissions with token creates permission", async () => {
      permissionService.create.mockResolvedValue({
        id: "33333333-3333-4333-8333-333333333333",
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

    it("GET /permissions without token returns 401", () => {
      return request(app.getHttpServer()).get("/permissions").expect(401);
    });
  });
});
