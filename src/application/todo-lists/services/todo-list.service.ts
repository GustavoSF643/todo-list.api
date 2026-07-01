import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  parsePaginationQuery,
  toPaginatedResponse,
  type PaginationQueryDto,
} from "@application/common/pagination";

import { TODO_ITEM_REPOSITORY } from "@application/todo-items/tokens/injection-tokens";
import type { TodoItemRepositoryPort } from "@application/todo-items/ports/todo-item.repository.port";
import type { TodoListEntity } from "@infra/database/entities/todo-list.entity";

import { CreateTodoListDto } from "../dto/create-todo-list.dto";
import { TodoListResponseDto } from "../dto/todo-list-response.dto";
import { UpdateTodoListDto } from "../dto/update-todo-list.dto";
import { toTodoListResponseDto } from "../mappers/todo-list-response.mapper";
import type { TodoListRepositoryPort } from "../ports/todo-list.repository.port";
import type { TodoListServicePort } from "../ports/todo-list.service.port";
import { TODO_LIST_REPOSITORY } from "../tokens/injection-tokens";

@Injectable()
export class TodoListService implements TodoListServicePort {
  constructor(
    @Inject(TODO_LIST_REPOSITORY)
    private readonly todoListRepository: TodoListRepositoryPort,
    @Inject(TODO_ITEM_REPOSITORY)
    private readonly todoItemRepository: TodoItemRepositoryPort,
  ) {}

  async findMine(userId: string, query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query);
    const { items, total } =
      await this.todoListRepository.findByUserIdPaginated(
        userId,
        pagination.skip,
        pagination.take,
      );
    return toPaginatedResponse(
      items.map((list) => toTodoListResponseDto(list)),
      total,
      pagination,
    );
  }

  async findPublic(userId: string, query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query);
    const { items, total } =
      await this.todoListRepository.findPublicExcludingUserIdPaginated(
        userId,
        pagination.skip,
        pagination.take,
      );
    return toPaginatedResponse(
      items.map((list) => toTodoListResponseDto(list, { includeOwner: true })),
      total,
      pagination,
    );
  }

  async findById(listId: string, userId: string): Promise<TodoListResponseDto> {
    const list = await this.getListForRead(listId, userId);
    return toTodoListResponseDto(list, {
      includeOwner: list.is_public && list.user_id !== userId,
    });
  }

  async create(
    userId: string,
    payload: CreateTodoListDto,
  ): Promise<TodoListResponseDto> {
    const created = this.todoListRepository.create({
      user_id: userId,
      title: payload.title,
      description: payload.description,
      is_public: payload.is_public ?? false,
    });
    const saved = await this.todoListRepository.save(created);
    return toTodoListResponseDto(saved);
  }

  async update(
    listId: string,
    userId: string,
    payload: UpdateTodoListDto,
  ): Promise<TodoListResponseDto> {
    const list = await this.getListForWrite(listId, userId);
    const updated = this.todoListRepository.merge(list, payload);
    const saved = await this.todoListRepository.save(updated);
    return toTodoListResponseDto(saved);
  }

  async remove(listId: string, userId: string): Promise<void> {
    const list = await this.getListForWrite(listId, userId);
    await this.todoItemRepository.softDeleteByTodoListId(list.external_id);
    const deleted = await this.todoListRepository.softDeleteByExternalId(
      list.external_id,
    );

    if (!deleted) {
      throw new NotFoundException("Lista de tarefas não encontrada.");
    }
  }

  async getListForRead(
    listId: string,
    userId: string,
  ): Promise<TodoListEntity> {
    const list = await this.todoListRepository.findByExternalId(listId);

    if (!list) {
      throw new NotFoundException("Lista de tarefas não encontrada.");
    }

    if (list.user_id === userId || list.is_public) {
      return list;
    }

    throw new NotFoundException("Lista de tarefas não encontrada.");
  }

  async getListForWrite(
    listId: string,
    userId: string,
  ): Promise<TodoListEntity> {
    const list = await this.todoListRepository.findByExternalId(listId);

    if (!list) {
      throw new NotFoundException("Lista de tarefas não encontrada.");
    }

    if (list.user_id !== userId) {
      throw new ForbiddenException(
        "Sua conta não possui permissão para alterar esta lista.",
      );
    }

    return list;
  }
}
