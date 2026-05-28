import { Controller, Get, Post } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";

import { RouteMethodEnum } from "@infra/database/enums";
import { TypeOrmRouteRepository } from "@infra/database/repositories/typeorm-route.repository";
import { RouteSyncService } from "./route-sync.service";

@Controller("sample")
class SampleController {
  @Get()
  list(): void {}

  @Get(":id")
  findById(): void {}

  @Post()
  create(): void {}
}

describe("RouteSyncService", () => {
  let service: RouteSyncService;
  const routeRepository = {
    bulkUpsert: jest
      .fn()
      .mockResolvedValue({ identifiers: [], generatedMaps: [], raw: [] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      imports: [DiscoveryModule],
      controllers: [SampleController],
      providers: [
        RouteSyncService,
        { provide: TypeOrmRouteRepository, useValue: routeRepository },
      ],
    }).compile();

    service = module.get(RouteSyncService);
  });

  it("discovers controller routes and upserts unique entries", async () => {
    await service.syncRoutes();

    expect(routeRepository.bulkUpsert).toHaveBeenCalledTimes(1);
    expect(routeRepository.bulkUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        { method: RouteMethodEnum.GET, path: "/sample" },
        { method: RouteMethodEnum.GET, path: "/sample/:id" },
        { method: RouteMethodEnum.POST, path: "/sample" },
      ]),
    );
    const calls = jest.mocked(routeRepository.bulkUpsert).mock.calls;
    expect(calls[0]?.[0]).toHaveLength(3);
  });

  it("calls bulkUpsert with empty array when no controllers are registered", async () => {
    const emptyModule = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [
        RouteSyncService,
        { provide: TypeOrmRouteRepository, useValue: routeRepository },
      ],
    }).compile();

    await emptyModule.get(RouteSyncService).syncRoutes();

    expect(routeRepository.bulkUpsert).toHaveBeenCalledWith([]);
  });
});
