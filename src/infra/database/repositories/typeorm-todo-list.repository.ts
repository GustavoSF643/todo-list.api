import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";

import type { TodoListRepositoryPort } from "@application/todo-lists";
import { TodoListEntity } from "../entities/todo-list.entity";

@Injectable()
export class TypeOrmTodoListRepository implements TodoListRepositoryPort {
  constructor(
    @InjectRepository(TodoListEntity)
    private readonly repository: Repository<TodoListEntity>,
  ) {}

  findByExternalId(externalId: string): Promise<TodoListEntity | null> {
    return this.repository.findOne({
      where: { external_id: externalId },
      relations: ["owner"],
    });
  }

  findByUserId(userId: string): Promise<TodoListEntity[]> {
    return this.repository.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
    });
  }

  findPublicExcludingUserId(userId: string): Promise<TodoListEntity[]> {
    return this.repository.find({
      where: { is_public: true, user_id: Not(userId) },
      relations: ["owner"],
      order: { created_at: "DESC" },
    });
  }

  save(todoList: TodoListEntity): Promise<TodoListEntity> {
    return this.repository.save(todoList);
  }

  create(data: Partial<TodoListEntity>): TodoListEntity {
    return this.repository.create(data);
  }

  merge(
    todoList: TodoListEntity,
    data: Partial<TodoListEntity>,
  ): TodoListEntity {
    return this.repository.merge(todoList, data);
  }

  async softDeleteByExternalId(externalId: string): Promise<boolean> {
    const result = await this.repository.softDelete({
      external_id: externalId,
    });
    return Boolean(result.affected);
  }
}
