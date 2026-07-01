import type { PaginatedResult } from "@application/common/pagination";
import type { TodoListEntity } from "@infra/database/entities/todo-list.entity";

export interface TodoListRepositoryPort {
  findByExternalId(externalId: string): Promise<TodoListEntity | null>;
  findByUserIdPaginated(
    userId: string,
    skip: number,
    take: number,
  ): Promise<PaginatedResult<TodoListEntity>>;
  findPublicExcludingUserIdPaginated(
    userId: string,
    skip: number,
    take: number,
  ): Promise<PaginatedResult<TodoListEntity>>;
  save(todoList: TodoListEntity): Promise<TodoListEntity>;
  create(data: Partial<TodoListEntity>): TodoListEntity;
  merge(
    todoList: TodoListEntity,
    data: Partial<TodoListEntity>,
  ): TodoListEntity;
  softDeleteByExternalId(externalId: string): Promise<boolean>;
}
