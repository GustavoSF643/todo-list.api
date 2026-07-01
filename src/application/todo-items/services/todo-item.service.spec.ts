import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import {
  TODO_LIST_SERVICE,
  type TodoListServicePort,
} from "@application/todo-lists";
import type { TodoItemEntity } from "@infra/database/entities/todo-item.entity";
import type { TodoListEntity } from "@infra/database/entities/todo-list.entity";
import type { TodoItemRepositoryPort } from "../ports/todo-item.repository.port";
import { TODO_ITEM_REPOSITORY } from "../tokens/injection-tokens";
import { TodoItemService } from "./todo-item.service";

const makeList = (partial: Partial<TodoListEntity> = {}): TodoListEntity =>
  ({
    id: 1,
    external_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    user_id: "11111111-1111-4111-8111-111111111111",
    title: "Compras",
    is_public: false,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...partial,
  }) as TodoListEntity;

const makeItem = (partial: Partial<TodoItemEntity> = {}): TodoItemEntity =>
  ({
    id: 1,
    external_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    todo_list_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Leite",
    completed: false,
    position: 0,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...partial,
  }) as TodoItemEntity;

describe("TodoItemService", () => {
  let service: TodoItemService;
  let todoItemRepository: jest.Mocked<TodoItemRepositoryPort>;
  let todoListService: jest.Mocked<TodoListServicePort>;

  beforeEach(async () => {
    todoItemRepository = {
      findByExternalId: jest.fn(),
      findByTodoListIdPaginated: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
      softDeleteByTodoListId: jest.fn(),
    };
    todoListService = {
      findMine: jest.fn(),
      findPublic: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getListForRead: jest.fn(),
      getListForWrite: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoItemService,
        { provide: TODO_ITEM_REPOSITORY, useValue: todoItemRepository },
        { provide: TODO_LIST_SERVICE, useValue: todoListService },
      ],
    }).compile();

    service = module.get(TodoItemService);
  });

  it("lists items when user can read list", async () => {
    todoListService.getListForRead.mockResolvedValue(makeList());
    todoItemRepository.findByTodoListIdPaginated.mockResolvedValue({
      items: [makeItem()],
      total: 1,
    });

    const result = await service.findByListId(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "11111111-1111-4111-8111-111111111111",
      {},
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe("Leite");
  });

  it("creates item for list owner", async () => {
    const list = makeList();
    const item = makeItem();
    todoListService.getListForWrite.mockResolvedValue(list);
    todoItemRepository.create.mockReturnValue(item);
    todoItemRepository.save.mockResolvedValue(item);

    const result = await service.create(
      list.external_id,
      list.user_id,
      { title: "Leite" },
    );

    expect(result.title).toBe("Leite");
  });

  it("forbids item creation for non-owner", async () => {
    todoListService.getListForWrite.mockRejectedValue(
      new ForbiddenException(),
    );

    await expect(
      service.create(
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "22222222-2222-4222-8222-222222222222",
        { title: "Leite" },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns 404 when reading items of inaccessible list", async () => {
    todoListService.getListForRead.mockRejectedValue(new NotFoundException());

    await expect(
      service.findByListId(
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "22222222-2222-4222-8222-222222222222",
        {},
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
