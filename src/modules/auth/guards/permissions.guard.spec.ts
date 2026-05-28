import {
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import type { Request } from "express";

import {
  PERMISSION_REPOSITORY,
  type PermissionRepositoryPort,
} from "@application/permissions";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PermissionRoutesService } from "../services/permission-routes.service";
import { PermissionsGuard } from "./permissions.guard";

function createContext(
  request: Partial<Request> & { user?: { permission_id?: string } },
): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe("PermissionsGuard", () => {
  let guard: PermissionsGuard;
  let permissionRoutesService: { getPermissionRoutesByPermissionId: jest.Mock };
  let permissionRepository: jest.Mocked<PermissionRepositoryPort>;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(async () => {
    permissionRoutesService = {
      getPermissionRoutesByPermissionId: jest.fn(),
    };
    permissionRepository = {
      findByExternalId: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
      existsByExternalId: jest.fn(),
      isSuperAdmin: jest.fn().mockResolvedValue(false),
    };
    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        { provide: PermissionRoutesService, useValue: permissionRoutesService },
        { provide: PERMISSION_REPOSITORY, useValue: permissionRepository },
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get(PermissionsGuard);
  });

  it("allows public routes without checking permissions", async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) =>
      key === IS_PUBLIC_KEY ? true : false,
    );

    const result = await guard.canActivate(createContext({ method: "GET" }));

    expect(result).toBe(true);
    expect(
      permissionRoutesService.getPermissionRoutesByPermissionId,
    ).not.toHaveBeenCalled();
  });

  it("allows super admin without checking routes", async () => {
    permissionRepository.isSuperAdmin.mockResolvedValue(true);

    const result = await guard.canActivate(
      createContext({
        method: "GET",
        baseUrl: "",
        route: { path: "/users" },
        user: { permission_id: "perm-admin" },
      }),
    );

    expect(result).toBe(true);
    expect(permissionRoutesService.getPermissionRoutesByPermissionId).not.toHaveBeenCalled();
  });

  it("denies when user has no permission_id", async () => {
    await expect(
      guard.canActivate(
        createContext({
          method: "GET",
          baseUrl: "",
          route: { path: "/users" },
        }),
      ),
    ).rejects.toThrow(
      new ForbiddenException("Usuário sem permissões definidas."),
    );
  });

  it("denies when permission has no routes", async () => {
    permissionRoutesService.getPermissionRoutesByPermissionId.mockResolvedValue(
      [],
    );

    await expect(
      guard.canActivate(
        createContext({
          method: "GET",
          baseUrl: "",
          route: { path: "/users" },
          user: { permission_id: "perm-1" },
        }),
      ),
    ).rejects.toThrow(
      new ForbiddenException("Usuário sem permissões definidas."),
    );
  });

  it("denies when route is not allowed", async () => {
    permissionRoutesService.getPermissionRoutesByPermissionId.mockResolvedValue(
      [{ method: "GET", path: "/permissions" }],
    );

    await expect(
      guard.canActivate(
        createContext({
          method: "GET",
          baseUrl: "",
          route: { path: "/users" },
          user: { permission_id: "perm-1" },
        }),
      ),
    ).rejects.toThrow(
      new ForbiddenException(
        "Sua conta não possui permissão para acessar este recurso.",
      ),
    );
  });

  it("allows when method and path match", async () => {
    permissionRoutesService.getPermissionRoutesByPermissionId.mockResolvedValue(
      [{ method: "GET", path: "/users/:id" }],
    );

    const result = await guard.canActivate(
      createContext({
        method: "GET",
        baseUrl: "",
        route: { path: "/users/:id" },
        user: { permission_id: "perm-1" },
      }),
    );

    expect(result).toBe(true);
  });
});
