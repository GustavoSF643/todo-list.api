import {
  Body,
  Controller,
  Delete,
  Get,
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
import {
  ApiPaginatedOkResponse,
  ApiPaginationQuery,
  PaginationQueryDto,
} from "@application/common/pagination";
import {
  CreateUserDto,
  UpdateUserDto,
  USER_SERVICE,
  UserResponseDto,
  type UserServicePort,
} from "@application/users";
import { Public } from "@modules/auth/decorators/public.decorator";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserServicePort,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: "Criar usuário (público)" })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() payload: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(payload);
  }

  @Get()
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Listar usuários" })
  @ApiPaginationQuery()
  @ApiPaginatedOkResponse(UserResponseDto)
  findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(":id")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiOkResponse({ type: UserResponseDto })
  findById(
    @Param("id", ParseUUIDPipe) externalId: string,
  ): Promise<UserResponseDto> {
    return this.userService.findByExternalId(externalId);
  }

  @Patch(":id")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Atualizar usuário" })
  @ApiOkResponse({ type: UserResponseDto })
  update(
    @Param("id", ParseUUIDPipe) externalId: string,
    @Body() payload: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(externalId, payload);
  }

  @Delete(":id")
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Remover usuário" })
  @ApiNoContentResponse()
  remove(@Param("id", ParseUUIDPipe) externalId: string): Promise<void> {
    return this.userService.remove(externalId);
  }
}
