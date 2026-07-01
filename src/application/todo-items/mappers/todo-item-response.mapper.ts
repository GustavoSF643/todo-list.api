import type { TodoItemEntity } from "@infra/database/entities/todo-item.entity";

import { TodoItemResponseDto } from "../dto/todo-item-response.dto";

export const toTodoItemResponseDto = (
  todoItem: TodoItemEntity,
): TodoItemResponseDto => ({
  id: todoItem.external_id,
  todo_list_id: todoItem.todo_list_id,
  title: todoItem.title,
  completed: todoItem.completed,
  position: todoItem.position,
  created_at: todoItem.created_at,
  updated_at: todoItem.updated_at,
});
