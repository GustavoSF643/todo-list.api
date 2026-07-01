import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { TODO_ITEM_REPOSITORY } from "@application/todo-items/tokens/injection-tokens";
import type { TodoItemRepositoryPort } from "@application/todo-items/ports/todo-item.repository.port";
import type { TodoListEntity } from "@infra/database/entities/todo-list.entity";
import type { TodoListRepositoryPort } from "../ports/todo-list.repository.port";
import { TODO_LIST_REPOSITORY } from "../tokens/injection-tokens";
import { TodoListService } from "./todo-list.service";

const makeList = (partial: Partial<TodoListEntity> = {}): TodoListEntity =>
  ({
    id: 1,
    external_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    user_id: "11111111-1111-4111-8111-111111111111",
    title: "Compras",
    description: "Mercado",
    is_public: false,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...partial,
  }) as TodoListEntity;

describe("TodoListService", () => {
  let service: TodoListService;
  let todoListRepository: jest.Mocked<TodoListRepositoryPort>;
  let todoItemRepository: jest.Mocked<TodoItemRepositoryPort>;

  beforeEach(async () => {
    todoListRepository = {
      findByExternalId: jest.fn(),
      findByUserIdPaginated: jest.fn(),
      findPublicExcludingUserIdPaginated: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
    };
    todoItemRepository = {
      findByExternalId: jest.fn(),
      findByTodoListIdPaginated: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
      softDeleteByTodoListId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoListService,
        { provide: TODO_LIST_REPOSITORY, useValue: todoListRepository },
        { provide: TODO_ITEM_REPOSITORY, useValue: todoItemRepository },
      ],
    }).compile();

    service = module.get(TodoListService);
  });

  it("creates list for authenticated user", async () => {
    const created = makeList();
    todoListRepository.create.mockReturnValue(created);
    todoListRepository.save.mockResolvedValue(created);

    const result = await service.create(
      "11111111-1111-4111-8111-111111111111",
      {
        title: "Compras",
      },
    );

    expect(todoListRepository.create).toHaveBeenCalledWith({
      user_id: "11111111-1111-4111-8111-111111111111",
      title: "Compras",
      description: undefined,
      is_public: false,
    });
    expect(result.title).toBe("Compras");
  });

  it("returns paginated lists for owner", async () => {
    const list = makeList();
    todoListRepository.findByUserIdPaginated.mockResolvedValue({
      items: [list],
      total: 1,
    });

    const result = await service.findMine(
      "11111111-1111-4111-8111-111111111111",
      { page: 1, limit: 10 },
    );

    expect(todoListRepository.findByUserIdPaginated).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      0,
      10,
    );
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it("returns paginated public lists excluding requester", async () => {
    const list = makeList({
      is_public: true,
      user_id: "22222222-2222-4222-8222-222222222222",
    });
    todoListRepository.findPublicExcludingUserIdPaginated.mockResolvedValue({
      items: [list],
      total: 1,
    });

    const result = await service.findPublic(
      "11111111-1111-4111-8111-111111111111",
      {},
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0].is_public).toBe(true);
  });

  it("returns 404 when non-owner reads private list", async () => {
    todoListRepository.findByExternalId.mockResolvedValue(
      makeList({ user_id: "22222222-2222-4222-8222-222222222222" }),
    );

    await expect(
      service.findById(
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "11111111-1111-4111-8111-111111111111",
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("allows non-owner to read public list", async () => {
    todoListRepository.findByExternalId.mockResolvedValue(
      makeList({
        is_public: true,
        user_id: "22222222-2222-4222-8222-222222222222",
      }),
    );

    const result = await service.findById(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "11111111-1111-4111-8111-111111111111",
    );

    expect(result.is_public).toBe(true);
  });

  it("forbids non-owner from updating list", async () => {
    todoListRepository.findByExternalId.mockResolvedValue(
      makeList({
        user_id: "22222222-2222-4222-8222-222222222222",
        is_public: true,
      }),
    );

    await expect(
      service.update(
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "11111111-1111-4111-8111-111111111111",
        { title: "Hack" },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("soft deletes list and items", async () => {
    const list = makeList();
    todoListRepository.findByExternalId.mockResolvedValue(list);
    todoListRepository.softDeleteByExternalId.mockResolvedValue(true);

    await service.remove(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "11111111-1111-4111-8111-111111111111",
    );

    expect(todoItemRepository.softDeleteByTodoListId).toHaveBeenCalledWith(
      list.external_id,
    );
    expect(todoListRepository.softDeleteByExternalId).toHaveBeenCalledWith(
      list.external_id,
    );
  });
});
