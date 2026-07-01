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
  Query,
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
  ApiPaginatedOkResponse,
  ApiPaginationQuery,
  PaginationQueryDto,
} from "@application/common/pagination";
import {
  CreateTodoListDto,
  TODO_LIST_SERVICE,
  TodoListResponseDto,
  UpdateTodoListDto,
  type TodoListServicePort,
} from "@application/todo-lists";
import { CurrentUser } from "@modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

@ApiTags("todo-lists")
@ApiBearerAuth("access-token")
@Controller("todo-lists")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TodoListsController {
  constructor(
    @Inject(TODO_LIST_SERVICE)
    private readonly todoListService: TodoListServicePort,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar minhas listas de tarefas" })
  @ApiPaginationQuery()
  @ApiPaginatedOkResponse(TodoListResponseDto)
  findMine(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.todoListService.findMine(user.sub, query);
  }

  @Get("public")
  @ApiOperation({ summary: "Listar listas públicas de outros usuários" })
  @ApiPaginationQuery()
  @ApiPaginatedOkResponse(TodoListResponseDto)
  findPublic(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.todoListService.findPublic(user.sub, query);
  }

  @Post()
  @ApiOperation({ summary: "Criar lista de tarefas" })
  @ApiCreatedResponse({ type: TodoListResponseDto })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() payload: CreateTodoListDto,
  ): Promise<TodoListResponseDto> {
    return this.todoListService.create(user.sub, payload);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar lista por ID" })
  @ApiOkResponse({ type: TodoListResponseDto })
  findById(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) listId: string,
  ): Promise<TodoListResponseDto> {
    return this.todoListService.findById(listId, user.sub);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar lista de tarefas" })
  @ApiOkResponse({ type: TodoListResponseDto })
  update(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) listId: string,
    @Body() payload: UpdateTodoListDto,
  ): Promise<TodoListResponseDto> {
    return this.todoListService.update(listId, user.sub, payload);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover lista de tarefas" })
  @ApiNoContentResponse()
  remove(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) listId: string,
  ): Promise<void> {
    return this.todoListService.remove(listId, user.sub);
  }
}
