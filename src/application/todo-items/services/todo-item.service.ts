import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  parsePaginationQuery,
  toPaginatedResponse,
  type PaginationQueryDto,
} from "@application/common/pagination";
import { TODO_LIST_SERVICE } from "@application/todo-lists/tokens/injection-tokens";
import type { TodoListServicePort } from "@application/todo-lists/ports/todo-list.service.port";

import { CreateTodoItemDto } from "../dto/create-todo-item.dto";
import { TodoItemResponseDto } from "../dto/todo-item-response.dto";
import { UpdateTodoItemDto } from "../dto/update-todo-item.dto";
import { toTodoItemResponseDto } from "../mappers/todo-item-response.mapper";
import type { TodoItemRepositoryPort } from "../ports/todo-item.repository.port";
import type { TodoItemServicePort } from "../ports/todo-item.service.port";
import { TODO_ITEM_REPOSITORY } from "../tokens/injection-tokens";

@Injectable()
export class TodoItemService implements TodoItemServicePort {
  constructor(
    @Inject(TODO_ITEM_REPOSITORY)
    private readonly todoItemRepository: TodoItemRepositoryPort,
    @Inject(forwardRef(() => TODO_LIST_SERVICE))
    private readonly todoListService: TodoListServicePort,
  ) {}

  async findByListId(
    listId: string,
    userId: string,
    query: PaginationQueryDto,
  ) {
    await this.todoListService.getListForRead(listId, userId);
    const pagination = parsePaginationQuery(query);
    const { items, total } =
      await this.todoItemRepository.findByTodoListIdPaginated(
        listId,
        pagination.skip,
        pagination.take,
      );
    return toPaginatedResponse(
      items.map((item) => toTodoItemResponseDto(item)),
      total,
      pagination,
    );
  }

  async create(
    listId: string,
    userId: string,
    payload: CreateTodoItemDto,
  ): Promise<TodoItemResponseDto> {
    const list = await this.todoListService.getListForWrite(listId, userId);
    const created = this.todoItemRepository.create({
      todo_list_id: list.external_id,
      title: payload.title,
      completed: payload.completed ?? false,
      position: payload.position ?? 0,
    });
    const saved = await this.todoItemRepository.save(created);
    return toTodoItemResponseDto(saved);
  }

  async update(
    listId: string,
    itemId: string,
    userId: string,
    payload: UpdateTodoItemDto,
  ): Promise<TodoItemResponseDto> {
    await this.todoListService.getListForWrite(listId, userId);
    const item = await this.getItemInList(listId, itemId);
    const updated = this.todoItemRepository.merge(item, payload);
    const saved = await this.todoItemRepository.save(updated);
    return toTodoItemResponseDto(saved);
  }

  async remove(listId: string, itemId: string, userId: string): Promise<void> {
    await this.todoListService.getListForWrite(listId, userId);
    await this.getItemInList(listId, itemId);
    const deleted = await this.todoItemRepository.softDeleteByExternalId(itemId);

    if (!deleted) {
      throw new NotFoundException("Item de tarefa não encontrado.");
    }
  }

  private async getItemInList(listId: string, itemId: string) {
    const item = await this.todoItemRepository.findByExternalId(itemId);

    if (!item || item.todo_list_id !== listId) {
      throw new NotFoundException("Item de tarefa não encontrado.");
    }

    return item;
  }
}
