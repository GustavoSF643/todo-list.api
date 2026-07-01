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
  CreateModuleDto,
  MODULE_SERVICE,
  ModuleResponseDto,
  UpdateModuleDto,
  type ModuleServicePort,
} from "@application/modules";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "@modules/auth/guards/permissions.guard";

@ApiTags("modules")
@ApiBearerAuth("access-token")
@Controller("modules")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ModulesController {
  constructor(
    @Inject(MODULE_SERVICE)
    private readonly moduleService: ModuleServicePort,
  ) {}

  @Post()
  @ApiOperation({ summary: "Criar módulo" })
  @ApiCreatedResponse({ type: ModuleResponseDto })
  create(@Body() payload: CreateModuleDto): Promise<ModuleResponseDto> {
    return this.moduleService.create(payload);
  }

  @Get()
  @ApiOperation({ summary: "Listar módulos" })
  @ApiPaginationQuery()
  @ApiPaginatedOkResponse(ModuleResponseDto)
  findAll(@Query() query: PaginationQueryDto) {
    return this.moduleService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar módulo por ID" })
  @ApiOkResponse({ type: ModuleResponseDto })
  findById(
    @Param("id", ParseUUIDPipe) externalId: string,
  ): Promise<ModuleResponseDto> {
    return this.moduleService.findByExternalId(externalId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar módulo" })
  @ApiOkResponse({ type: ModuleResponseDto })
  update(
    @Param("id", ParseUUIDPipe) externalId: string,
    @Body() payload: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    return this.moduleService.update(externalId, payload);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover módulo" })
  @ApiNoContentResponse()
  remove(@Param("id", ParseUUIDPipe) externalId: string): Promise<void> {
    return this.moduleService.remove(externalId);
  }
}
