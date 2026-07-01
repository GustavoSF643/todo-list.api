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
  AddModuleRoutesDto,
  MODULE_ROUTES_SERVICE,
  ModuleRouteResponseDto,
  SyncModuleRoutesDto,
  type ModuleRoutesServicePort,
} from "@application/module-routes";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

@ApiTags("modules")
@ApiBearerAuth("access-token")
@Controller("modules/:moduleId/routes")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ModuleRoutesController {
  constructor(
    @Inject(MODULE_ROUTES_SERVICE)
    private readonly moduleRoutesService: ModuleRoutesServicePort,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar rotas vinculadas ao módulo" })
  @ApiPaginationQuery()
  @ApiPaginatedOkResponse(ModuleRouteResponseDto)
  list(
    @Param("moduleId", ParseUUIDPipe) moduleId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.moduleRoutesService.listByModuleId(moduleId, query);
  }

  @Put()
  @ApiOperation({
    summary: "Substituir rotas vinculadas ao módulo",
    description:
      "Define a lista completa de rotas do módulo. Vínculos atuais não presentes na lista são removidos.",
  })
  @ApiOkResponse({ type: ModuleRouteResponseDto, isArray: true })
  sync(
    @Param("moduleId", ParseUUIDPipe) moduleId: string,
    @Body() payload: SyncModuleRoutesDto,
  ): Promise<ModuleRouteResponseDto[]> {
    return this.moduleRoutesService.sync(moduleId, payload);
  }

  @Post()
  @ApiOperation({ summary: "Vincular rotas ao módulo" })
  @ApiOkResponse({ type: ModuleRouteResponseDto, isArray: true })
  add(
    @Param("moduleId", ParseUUIDPipe) moduleId: string,
    @Body() payload: AddModuleRoutesDto,
  ): Promise<ModuleRouteResponseDto[]> {
    return this.moduleRoutesService.add(moduleId, payload);
  }

  @Delete(":routeId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desvincular rota do módulo" })
  @ApiNoContentResponse()
  remove(
    @Param("moduleId", ParseUUIDPipe) moduleId: string,
    @Param("routeId", ParseUUIDPipe) routeId: string,
  ): Promise<void> {
    return this.moduleRoutesService.remove(moduleId, routeId);
  }
}
