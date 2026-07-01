import { Delete, Get, Patch, Post, Controller } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";

import { RouteMethodEnum } from "@infra/database/enums";
import { TypeOrmRouteRepository } from "@infra/database/repositories/typeorm-route.repository";
import { RouteSyncService } from "./route-sync.service";

@Controller("todo-lists")
class TodoListsRoutesProbeController {
  @Get()
  findMine(): void {}

  @Get("public")
  findPublic(): void {}

  @Post()
  create(): void {}

  @Get(":id")
  findById(): void {}

  @Patch(":id")
  update(): void {}

  @Delete(":id")
  remove(): void {}
}

@Controller("todo-lists/:listId/items")
class TodoItemsRoutesProbeController {
  @Get()
  findByListId(): void {}

  @Post()
  create(): void {}

  @Patch(":itemId")
  update(): void {}

  @Delete(":itemId")
  remove(): void {}
}

describe("RouteSyncService (todo-lists)", () => {
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
      controllers: [
        TodoListsRoutesProbeController,
        TodoItemsRoutesProbeController,
      ],
      providers: [
        RouteSyncService,
        { provide: TypeOrmRouteRepository, useValue: routeRepository },
      ],
    }).compile();

    service = module.get(RouteSyncService);
  });

  it("discovers todo-list routes for RouteSyncService", async () => {
    await service.syncRoutes();

    expect(routeRepository.bulkUpsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        { method: RouteMethodEnum.GET, path: "/todo-lists" },
        { method: RouteMethodEnum.GET, path: "/todo-lists/public" },
        { method: RouteMethodEnum.POST, path: "/todo-lists" },
        { method: RouteMethodEnum.GET, path: "/todo-lists/:id" },
        { method: RouteMethodEnum.PATCH, path: "/todo-lists/:id" },
        { method: RouteMethodEnum.DELETE, path: "/todo-lists/:id" },
        {
          method: RouteMethodEnum.GET,
          path: "/todo-lists/:listId/items",
        },
        {
          method: RouteMethodEnum.POST,
          path: "/todo-lists/:listId/items",
        },
        {
          method: RouteMethodEnum.PATCH,
          path: "/todo-lists/:listId/items/:itemId",
        },
        {
          method: RouteMethodEnum.DELETE,
          path: "/todo-lists/:listId/items/:itemId",
        },
      ]),
    );
  });
});
