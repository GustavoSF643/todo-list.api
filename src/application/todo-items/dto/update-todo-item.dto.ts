import { PartialType } from "@nestjs/swagger";

import { CreateTodoItemDto } from "./create-todo-item.dto";

export class UpdateTodoItemDto extends PartialType(CreateTodoItemDto) {}
