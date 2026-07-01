import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  TODO_ITEM_REPOSITORY,
  TODO_ITEM_SERVICE,
  TodoItemService,
} from "@application/todo-items";
import {
  TODO_LIST_REPOSITORY,
  TODO_LIST_SERVICE,
  TodoListService,
} from "@application/todo-lists";
import { TodoItemEntity } from "@infra/database/entities/todo-item.entity";
import { TodoListEntity } from "@infra/database/entities/todo-list.entity";
import { TypeOrmTodoItemRepository } from "@infra/database/repositories/typeorm-todo-item.repository";
import { TypeOrmTodoListRepository } from "@infra/database/repositories/typeorm-todo-list.repository";
import { AuthModule } from "@modules/auth/auth.module";
import { TodoItemsController } from "./todo-items.controller";
import { TodoListsController } from "./todo-lists.controller";

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([TodoListEntity, TodoItemEntity]),
  ],
  controllers: [TodoListsController, TodoItemsController],
  providers: [
    {
      provide: TODO_LIST_REPOSITORY,
      useClass: TypeOrmTodoListRepository,
    },
    {
      provide: TODO_ITEM_REPOSITORY,
      useClass: TypeOrmTodoItemRepository,
    },
    {
      provide: TODO_LIST_SERVICE,
      useClass: TodoListService,
    },
    {
      provide: TODO_ITEM_SERVICE,
      useClass: TodoItemService,
    },
  ],
  exports: [TODO_LIST_SERVICE, TODO_ITEM_SERVICE],
})
export class TodoListsModule {}
