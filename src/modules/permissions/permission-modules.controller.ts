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
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
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
  AddPermissionModulesDto,
  PERMISSION_MODULES_SERVICE,
  PermissionModuleResponseDto,
  SyncPermissionModulesDto,
  type PermissionModulesServicePort,
} from "@application/permission-modules";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

@ApiTags("permissions")
@ApiBearerAuth("access-token")
@Controller("permissions/:permissionId/modules")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionModulesController {
  constructor(
    @Inject(PERMISSION_MODULES_SERVICE)
    private readonly permissionModulesService: PermissionModulesServicePort,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar módulos vinculados à permissão" })
  @ApiPaginationQuery()
  @ApiPaginatedOkResponse(PermissionModuleResponseDto)
  list(
    @Param("permissionId", ParseUUIDPipe) permissionId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.permissionModulesService.listByPermissionId(
      permissionId,
      query,
    );
  }

  @Put()
  @ApiOperation({
    summary: "Substituir módulos vinculados à permissão",
    description:
      "Define a lista completa de módulos da permissão. Vínculos atuais não presentes na lista são removidos.",
  })
  @ApiOkResponse({ type: PermissionModuleResponseDto, isArray: true })
  sync(
    @Param("permissionId", ParseUUIDPipe) permissionId: string,
    @Body() payload: SyncPermissionModulesDto,
  ): Promise<PermissionModuleResponseDto[]> {
    return this.permissionModulesService.sync(permissionId, payload);
  }

  @Post()
  @ApiOperation({ summary: "Vincular módulos à permissão" })
  @ApiOkResponse({ type: PermissionModuleResponseDto, isArray: true })
  add(
    @Param("permissionId", ParseUUIDPipe) permissionId: string,
    @Body() payload: AddPermissionModulesDto,
  ): Promise<PermissionModuleResponseDto[]> {
    return this.permissionModulesService.add(permissionId, payload);
  }

  @Delete(":moduleId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desvincular módulo da permissão" })
  @ApiNoContentResponse()
  remove(
    @Param("permissionId", ParseUUIDPipe) permissionId: string,
    @Param("moduleId", ParseUUIDPipe) moduleId: string,
  ): Promise<void> {
    return this.permissionModulesService.remove(permissionId, moduleId);
  }
}
