import type { PaginatedResult } from "@application/common/pagination";
import type { TodoItemEntity } from "@infra/database/entities/todo-item.entity";

export interface TodoItemRepositoryPort {
  findByExternalId(externalId: string): Promise<TodoItemEntity | null>;
  findByTodoListIdPaginated(
    todoListId: string,
    skip: number,
    take: number,
  ): Promise<PaginatedResult<TodoItemEntity>>;
  save(todoItem: TodoItemEntity): Promise<TodoItemEntity>;
  create(data: Partial<TodoItemEntity>): TodoItemEntity;
  merge(
    todoItem: TodoItemEntity,
    data: Partial<TodoItemEntity>,
  ): TodoItemEntity;
  softDeleteByExternalId(externalId: string): Promise<boolean>;
  softDeleteByTodoListId(todoListId: string): Promise<void>;
}
