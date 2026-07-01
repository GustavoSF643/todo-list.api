import type { TodoListEntity } from "@infra/database/entities/todo-list.entity";

import { TodoListResponseDto } from "../dto/todo-list-response.dto";

export const toTodoListResponseDto = (
  todoList: TodoListEntity,
  options?: { includeOwner?: boolean },
): TodoListResponseDto => ({
  id: todoList.external_id,
  user_id: todoList.user_id,
  title: todoList.title,
  description: todoList.description,
  is_public: todoList.is_public,
  owner:
    options?.includeOwner && todoList.owner
      ? {
          id: todoList.owner.external_id,
          first_name: todoList.owner.first_name,
          last_name: todoList.owner.last_name,
        }
      : undefined,
  created_at: todoList.created_at,
  updated_at: todoList.updated_at,
});
