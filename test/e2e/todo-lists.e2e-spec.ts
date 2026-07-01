import type { INestApplication } from "@nestjs/common";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";

import { TODO_LIST_SERVICE } from "@application/todo-lists";
import { TODO_ITEM_SERVICE } from "@application/todo-items";
import { TodoItemsController } from "@modules/todo-lists/todo-items.controller";
import { TodoListsController } from "@modules/todo-lists/todo-lists.controller";
import { createControllerTestApp } from "../support/app/create-controller-test-app";
import {
  E2E_TODO_ITEM_ID,
  E2E_TODO_LIST_ID,
  E2E_USER_ID,
} from "../support/fixtures/e2e-fixtures";
import { bearer } from "../support/http/bearer";
import { paginatedResponse } from "../support/http/paginated-response";

describe("Todo Lists (e2e)", () => {
  let app: INestApplication<App>;
  const todoListService = {
    findMine: jest.fn(),
    findPublic: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getListForRead: jest.fn(),
    getListForWrite: jest.fn(),
  };
  const todoItemService = {
    findByListId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    app = await createControllerTestApp({
      controllers: [TodoListsController, TodoItemsController],
      providers: [
        { provide: TODO_LIST_SERVICE, useValue: todoListService },
        { provide: TODO_ITEM_SERVICE, useValue: todoItemService },
      ],
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /todo-lists without token returns 401", () => {
    return request(app.getHttpServer()).get("/todo-lists").expect(401);
  });

  it("GET /todo-lists returns paginated owner lists", async () => {
    todoListService.findMine.mockResolvedValue(
      paginatedResponse([
        {
          id: E2E_TODO_LIST_ID,
          user_id: E2E_USER_ID,
          title: "Minha lista",
          is_public: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]),
    );

    const response = await request(app.getHttpServer())
      .get("/todo-lists")
      .set(bearer())
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.page).toBe(1);
    expect(todoListService.findMine).toHaveBeenCalledWith(E2E_USER_ID, {});
  });

  it("GET /todo-lists/public returns paginated public lists", async () => {
    todoListService.findPublic.mockResolvedValue(
      paginatedResponse([
        {
          id: E2E_TODO_LIST_ID,
          user_id: "22222222-2222-4222-8222-222222222222",
          title: "Pública",
          is_public: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]),
    );

    const response = await request(app.getHttpServer())
      .get("/todo-lists/public?page=1&limit=20")
      .set(bearer())
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(todoListService.findPublic).toHaveBeenCalledWith(E2E_USER_ID, {
      page: 1,
      limit: 20,
    });
  });

  it("owner creates private list and lists items", async () => {
    todoListService.create.mockResolvedValue({
      id: E2E_TODO_LIST_ID,
      user_id: E2E_USER_ID,
      title: "Privada",
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    todoItemService.findByListId.mockResolvedValue(
      paginatedResponse([
        {
          id: E2E_TODO_ITEM_ID,
          todo_list_id: E2E_TODO_LIST_ID,
          title: "Leite",
          completed: false,
          position: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]),
    );

    const createResponse = await request(app.getHttpServer())
      .post("/todo-lists")
      .set(bearer())
      .send({ title: "Privada" })
      .expect(201);

    expect(createResponse.body.title).toBe("Privada");
    expect(todoListService.create).toHaveBeenCalledWith(E2E_USER_ID, {
      title: "Privada",
    });

    const itemsResponse = await request(app.getHttpServer())
      .get(`/todo-lists/${E2E_TODO_LIST_ID}/items`)
      .set(bearer())
      .expect(200);

    expect(itemsResponse.body.data).toHaveLength(1);
    expect(todoItemService.findByListId).toHaveBeenCalledWith(
      E2E_TODO_LIST_ID,
      E2E_USER_ID,
      {},
    );
  });

  it("owner marks list public and other user reads list and items", async () => {
    todoListService.update.mockResolvedValue({
      id: E2E_TODO_LIST_ID,
      user_id: E2E_USER_ID,
      title: "Pública",
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    todoListService.findById.mockResolvedValue({
      id: E2E_TODO_LIST_ID,
      user_id: E2E_USER_ID,
      title: "Pública",
      is_public: true,
      owner: {
        id: E2E_USER_ID,
        first_name: "John",
        last_name: "Doe",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    todoItemService.findByListId.mockResolvedValue(paginatedResponse([]));

    await request(app.getHttpServer())
      .patch(`/todo-lists/${E2E_TODO_LIST_ID}`)
      .set(bearer())
      .send({ is_public: true })
      .expect(200);

    const listResponse = await request(app.getHttpServer())
      .get(`/todo-lists/${E2E_TODO_LIST_ID}`)
      .set(bearer())
      .expect(200);

    expect(listResponse.body.is_public).toBe(true);

    await request(app.getHttpServer())
      .get(`/todo-lists/${E2E_TODO_LIST_ID}/items`)
      .set(bearer())
      .expect(200);
  });

  it("other user gets 404 for private list and 403 when editing public list", async () => {
    todoListService.findById.mockRejectedValue(
      new NotFoundException("Lista de tarefas não encontrada."),
    );
    todoListService.update.mockRejectedValue(
      new ForbiddenException(
        "Sua conta não possui permissão para alterar esta lista.",
      ),
    );

    await request(app.getHttpServer())
      .get(`/todo-lists/${E2E_TODO_LIST_ID}`)
      .set(bearer())
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/todo-lists/${E2E_TODO_LIST_ID}`)
      .set(bearer())
      .send({ title: "Hack" })
      .expect(403);
  });

  it("delete list removes access to items", async () => {
    todoListService.remove.mockResolvedValue(undefined);
    todoItemService.findByListId.mockRejectedValue(
      new NotFoundException("Lista de tarefas não encontrada."),
    );

    await request(app.getHttpServer())
      .delete(`/todo-lists/${E2E_TODO_LIST_ID}`)
      .set(bearer())
      .expect(204);

    await request(app.getHttpServer())
      .get(`/todo-lists/${E2E_TODO_LIST_ID}/items`)
      .set(bearer())
      .expect(404);
  });
});
