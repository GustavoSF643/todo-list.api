import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { TodoItemRepositoryPort } from "@application/todo-items";
import { TodoItemEntity } from "../entities/todo-item.entity";

@Injectable()
export class TypeOrmTodoItemRepository implements TodoItemRepositoryPort {
  constructor(
    @InjectRepository(TodoItemEntity)
    private readonly repository: Repository<TodoItemEntity>,
  ) {}

  findByExternalId(externalId: string): Promise<TodoItemEntity | null> {
    return this.repository.findOne({ where: { external_id: externalId } });
  }

  findByTodoListId(todoListId: string): Promise<TodoItemEntity[]> {
    return this.repository.find({
      where: { todo_list_id: todoListId },
      order: { position: "ASC", created_at: "ASC" },
    });
  }

  save(todoItem: TodoItemEntity): Promise<TodoItemEntity> {
    return this.repository.save(todoItem);
  }

  create(data: Partial<TodoItemEntity>): TodoItemEntity {
    return this.repository.create(data);
  }

  merge(
    todoItem: TodoItemEntity,
    data: Partial<TodoItemEntity>,
  ): TodoItemEntity {
    return this.repository.merge(todoItem, data);
  }

  async softDeleteByExternalId(externalId: string): Promise<boolean> {
    const result = await this.repository.softDelete({
      external_id: externalId,
    });
    return Boolean(result.affected);
  }

  async softDeleteByTodoListId(todoListId: string): Promise<void> {
    await this.repository.softDelete({ todo_list_id: todoListId });
  }
}
