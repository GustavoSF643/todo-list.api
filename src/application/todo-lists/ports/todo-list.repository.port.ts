import type { TodoListEntity } from "@infra/database/entities/todo-list.entity";

export interface TodoListRepositoryPort {
  findByExternalId(externalId: string): Promise<TodoListEntity | null>;
  findByUserId(userId: string): Promise<TodoListEntity[]>;
  findPublicExcludingUserId(userId: string): Promise<TodoListEntity[]>;
  save(todoList: TodoListEntity): Promise<TodoListEntity>;
  create(data: Partial<TodoListEntity>): TodoListEntity;
  merge(
    todoList: TodoListEntity,
    data: Partial<TodoListEntity>,
  ): TodoListEntity;
  softDeleteByExternalId(externalId: string): Promise<boolean>;
}
