import { CreateTodoItemDto } from "../dto/create-todo-item.dto";
import { TodoItemResponseDto } from "../dto/todo-item-response.dto";
import { UpdateTodoItemDto } from "../dto/update-todo-item.dto";

export interface TodoItemServicePort {
  findByListId(
    listId: string,
    userId: string,
  ): Promise<TodoItemResponseDto[]>;
  create(
    listId: string,
    userId: string,
    payload: CreateTodoItemDto,
  ): Promise<TodoItemResponseDto>;
  update(
    listId: string,
    itemId: string,
    userId: string,
    payload: UpdateTodoItemDto,
  ): Promise<TodoItemResponseDto>;
  remove(listId: string, itemId: string, userId: string): Promise<void>;
}
