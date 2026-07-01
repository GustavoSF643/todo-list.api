import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import type { JwtPayload } from "@application/auth";
import {
  CreateTodoItemDto,
  TODO_ITEM_SERVICE,
  TodoItemResponseDto,
  UpdateTodoItemDto,
  type TodoItemServicePort,
} from "@application/todo-items";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

@ApiTags("todo-lists")
@ApiBearerAuth("access-token")
@Controller("todo-lists/:listId/items")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TodoItemsController {
  constructor(
    @Inject(TODO_ITEM_SERVICE)
    private readonly todoItemService: TodoItemServicePort,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar itens da lista" })
  @ApiOkResponse({ type: TodoItemResponseDto, isArray: true })
  findByListId(
    @CurrentUser() user: JwtPayload,
    @Param("listId", ParseUUIDPipe) listId: string,
  ): Promise<TodoItemResponseDto[]> {
    return this.todoItemService.findByListId(listId, user.sub);
  }

  @Post()
  @ApiOperation({ summary: "Criar item na lista" })
  @ApiCreatedResponse({ type: TodoItemResponseDto })
  create(
    @CurrentUser() user: JwtPayload,
    @Param("listId", ParseUUIDPipe) listId: string,
    @Body() payload: CreateTodoItemDto,
  ): Promise<TodoItemResponseDto> {
    return this.todoItemService.create(listId, user.sub, payload);
  }

  @Patch(":itemId")
  @ApiOperation({ summary: "Atualizar item da lista" })
  @ApiOkResponse({ type: TodoItemResponseDto })
  update(
    @CurrentUser() user: JwtPayload,
    @Param("listId", ParseUUIDPipe) listId: string,
    @Param("itemId", ParseUUIDPipe) itemId: string,
    @Body() payload: UpdateTodoItemDto,
  ): Promise<TodoItemResponseDto> {
    return this.todoItemService.update(listId, itemId, user.sub, payload);
  }

  @Delete(":itemId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover item da lista" })
  @ApiNoContentResponse()
  remove(
    @CurrentUser() user: JwtPayload,
    @Param("listId", ParseUUIDPipe) listId: string,
    @Param("itemId", ParseUUIDPipe) itemId: string,
  ): Promise<void> {
    return this.todoItemService.remove(listId, itemId, user.sub);
  }
}
