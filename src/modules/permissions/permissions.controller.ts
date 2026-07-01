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
  CreatePermissionDto,
  PERMISSION_SERVICE,
  PermissionResponseDto,
  UpdatePermissionDto,
  type PermissionServicePort,
} from "@application/permissions";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

@ApiTags("permissions")
@ApiBearerAuth("access-token")
@Controller("permissions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(
    @Inject(PERMISSION_SERVICE)
    private readonly permissionService: PermissionServicePort,
  ) {}

  @Post()
  @ApiOperation({ summary: "Criar permissão" })
  @ApiCreatedResponse({ type: PermissionResponseDto })
  create(@Body() payload: CreatePermissionDto): Promise<PermissionResponseDto> {
    return this.permissionService.create(payload);
  }

  @Get()
  @ApiOperation({ summary: "Listar permissões" })
  @ApiPaginationQuery()
  @ApiPaginatedOkResponse(PermissionResponseDto)
  findAll(@Query() query: PaginationQueryDto) {
    return this.permissionService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar permissão por ID" })
  @ApiOkResponse({ type: PermissionResponseDto })
  findById(
    @Param("id", ParseUUIDPipe) externalId: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.findByExternalId(externalId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar permissão" })
  @ApiOkResponse({ type: PermissionResponseDto })
  update(
    @Param("id", ParseUUIDPipe) externalId: string,
    @Body() payload: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.update(externalId, payload);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover permissão" })
  @ApiNoContentResponse()
  remove(@Param("id", ParseUUIDPipe) externalId: string): Promise<void> {
    return this.permissionService.remove(externalId);
  }
}
