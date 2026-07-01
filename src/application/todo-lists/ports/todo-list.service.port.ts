import type {
  PaginatedResponseDto,
  PaginationQueryDto,
} from "@application/common/pagination";

import { CreateTodoListDto } from "../dto/create-todo-list.dto";
import { TodoListResponseDto } from "../dto/todo-list-response.dto";
import { UpdateTodoListDto } from "../dto/update-todo-list.dto";
import type { TodoListEntity } from "@infra/database/entities/todo-list.entity";

export interface TodoListServicePort {
  findMine(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<TodoListResponseDto>>;
  findPublic(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<TodoListResponseDto>>;
  findById(listId: string, userId: string): Promise<TodoListResponseDto>;
  create(
    userId: string,
    payload: CreateTodoListDto,
  ): Promise<TodoListResponseDto>;
  update(
    listId: string,
    userId: string,
    payload: UpdateTodoListDto,
  ): Promise<TodoListResponseDto>;
  remove(listId: string, userId: string): Promise<void>;
  getListForRead(listId: string, userId: string): Promise<TodoListEntity>;
  getListForWrite(listId: string, userId: string): Promise<TodoListEntity>;
}
