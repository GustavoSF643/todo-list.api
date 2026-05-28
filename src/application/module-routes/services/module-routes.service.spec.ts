import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import type { ModuleRepositoryPort } from "@application/modules";
import { MODULE_REPOSITORY } from "@application/modules";
import type { ModuleRouteEntity } from "@infra/database/entities/module-route.entity";
import type { RouteEntity } from "@infra/database/entities/route.entity";
import { RouteMethodEnum } from "@infra/database/enums";
import type { ModuleRouteRepositoryPort } from "../ports/module-route.repository.port";
import type { RouteQueryRepositoryPort } from "../ports/route-query.repository.port";
import {
  MODULE_ROUTE_REPOSITORY,
  ROUTE_QUERY_REPOSITORY,
} from "../tokens/injection-tokens";
import { ModuleRoutesService } from "./module-routes.service";

const MODULE_ID = "11111111-1111-4111-8111-111111111111";
const ROUTE_A = "22222222-2222-4222-8222-222222222222";
const ROUTE_B = "33333333-3333-4333-8333-333333333333";

const makeRoute = (externalId: string): RouteEntity =>
  ({
    external_id: externalId,
    method: RouteMethodEnum.GET,
    path: "/users",
    is_active: true,
  }) as RouteEntity;

describe("ModuleRoutesService", () => {
  let service: ModuleRoutesService;
  let moduleRepository: jest.Mocked<ModuleRepositoryPort>;
  let moduleRouteRepository: jest.Mocked<ModuleRouteRepositoryPort>;
  let routeQueryRepository: jest.Mocked<RouteQueryRepositoryPort>;

  beforeEach(async () => {
    moduleRepository = {
      findByExternalId: jest.fn(),
      findByName: jest.fn(),
      findByModuleKey: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
    };

    moduleRouteRepository = {
      findActiveByModuleId: jest.fn(),
      findByModuleIdAndRouteId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDeleteAllByModuleId: jest.fn(),
      softDeleteByModuleIdAndRouteId: jest.fn(),
      restore: jest.fn(),
    };

    routeQueryRepository = {
      findActiveByExternalIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleRoutesService,
        { provide: MODULE_REPOSITORY, useValue: moduleRepository },
        { provide: MODULE_ROUTE_REPOSITORY, useValue: moduleRouteRepository },
        { provide: ROUTE_QUERY_REPOSITORY, useValue: routeQueryRepository },
      ],
    }).compile();

    service = module.get(ModuleRoutesService);
  });

  it("lists routes linked to module", async () => {
    moduleRepository.findByExternalId.mockResolvedValue({} as never);
    moduleRouteRepository.findActiveByModuleId.mockResolvedValue([
      { route_id: ROUTE_A } as ModuleRouteEntity,
    ]);
    routeQueryRepository.findActiveByExternalIds.mockResolvedValue([
      makeRoute(ROUTE_A),
    ]);

    const result = await service.listByModuleId(MODULE_ID);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(ROUTE_A);
  });

  it("sync replaces module route links", async () => {
    moduleRepository.findByExternalId.mockResolvedValue({} as never);
    routeQueryRepository.findActiveByExternalIds.mockResolvedValue([
      makeRoute(ROUTE_A),
      makeRoute(ROUTE_B),
    ]);
    moduleRouteRepository.findByModuleIdAndRouteId.mockResolvedValue(null);
    moduleRouteRepository.create.mockImplementation(
      (data) => data as ModuleRouteEntity,
    );
    moduleRouteRepository.save.mockResolvedValue({} as ModuleRouteEntity);
    moduleRouteRepository.findActiveByModuleId.mockResolvedValue([
      { route_id: ROUTE_A } as ModuleRouteEntity,
      { route_id: ROUTE_B } as ModuleRouteEntity,
    ]);
    routeQueryRepository.findActiveByExternalIds
      .mockResolvedValueOnce([makeRoute(ROUTE_A), makeRoute(ROUTE_B)])
      .mockResolvedValueOnce([makeRoute(ROUTE_A), makeRoute(ROUTE_B)]);

    await service.sync(MODULE_ID, { route_ids: [ROUTE_A, ROUTE_B] });

    expect(moduleRouteRepository.softDeleteAllByModuleId).toHaveBeenCalledWith(
      MODULE_ID,
    );
    expect(moduleRouteRepository.save).toHaveBeenCalledTimes(2);
  });

  it("throws when route does not exist on sync", async () => {
    moduleRepository.findByExternalId.mockResolvedValue({} as never);
    routeQueryRepository.findActiveByExternalIds.mockResolvedValue([
      makeRoute(ROUTE_A),
    ]);

    await expect(
      service.sync(MODULE_ID, { route_ids: [ROUTE_A, ROUTE_B] }),
    ).rejects.toThrow(BadRequestException);
  });

  it("throws not found when unlink does not exist", async () => {
    moduleRepository.findByExternalId.mockResolvedValue({} as never);
    moduleRouteRepository.softDeleteByModuleIdAndRouteId.mockResolvedValue(
      false,
    );

    await expect(service.remove(MODULE_ID, ROUTE_A)).rejects.toThrow(
      NotFoundException,
    );
  });
});
