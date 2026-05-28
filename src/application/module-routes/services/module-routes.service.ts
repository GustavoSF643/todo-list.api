import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  MODULE_REPOSITORY,
  type ModuleRepositoryPort,
} from "@application/modules";
import { AddModuleRoutesDto } from "../dto/add-module-routes.dto";
import { ModuleRouteResponseDto } from "../dto/module-route-response.dto";
import { SyncModuleRoutesDto } from "../dto/sync-module-routes.dto";
import { toModuleRouteResponseDto } from "../mappers/module-route-response.mapper";
import type { ModuleRouteRepositoryPort } from "../ports/module-route.repository.port";
import type { ModuleRoutesServicePort } from "../ports/module-routes.service.port";
import type { RouteQueryRepositoryPort } from "../ports/route-query.repository.port";
import {
  MODULE_ROUTE_REPOSITORY,
  ROUTE_QUERY_REPOSITORY,
} from "../tokens/injection-tokens";

@Injectable()
export class ModuleRoutesService implements ModuleRoutesServicePort {
  constructor(
    @Inject(MODULE_REPOSITORY)
    private readonly moduleRepository: ModuleRepositoryPort,
    @Inject(MODULE_ROUTE_REPOSITORY)
    private readonly moduleRouteRepository: ModuleRouteRepositoryPort,
    @Inject(ROUTE_QUERY_REPOSITORY)
    private readonly routeQueryRepository: RouteQueryRepositoryPort,
  ) {}

  async listByModuleId(moduleId: string): Promise<ModuleRouteResponseDto[]> {
    await this.ensureModuleExists(moduleId);
    const routes = await this.findRoutesByModuleId(moduleId);
    return routes.map((route) => toModuleRouteResponseDto(route));
  }

  async sync(
    moduleId: string,
    payload: SyncModuleRoutesDto,
  ): Promise<ModuleRouteResponseDto[]> {
    await this.ensureModuleExists(moduleId);
    await this.ensureRoutesExist(payload.route_ids);

    await this.moduleRouteRepository.softDeleteAllByModuleId(moduleId);

    for (const routeId of payload.route_ids) {
      await this.linkRoute(moduleId, routeId);
    }

    return this.listByModuleId(moduleId);
  }

  async add(
    moduleId: string,
    payload: AddModuleRoutesDto,
  ): Promise<ModuleRouteResponseDto[]> {
    await this.ensureModuleExists(moduleId);
    await this.ensureRoutesExist(payload.route_ids);

    for (const routeId of payload.route_ids) {
      await this.linkRoute(moduleId, routeId);
    }

    return this.listByModuleId(moduleId);
  }

  async remove(moduleId: string, routeId: string): Promise<void> {
    await this.ensureModuleExists(moduleId);

    const wasDeleted =
      await this.moduleRouteRepository.softDeleteByModuleIdAndRouteId(
        moduleId,
        routeId,
      );

    if (!wasDeleted) {
      throw new NotFoundException(
        "Vínculo entre módulo e rota não encontrado.",
      );
    }
  }

  private async linkRoute(moduleId: string, routeId: string): Promise<void> {
    const existing = await this.moduleRouteRepository.findByModuleIdAndRouteId(
      moduleId,
      routeId,
    );

    if (!existing) {
      const entity = this.moduleRouteRepository.create({
        module_id: moduleId,
        route_id: routeId,
      });
      await this.moduleRouteRepository.save(entity);
      return;
    }

    if (existing.deleted_at) {
      await this.moduleRouteRepository.restore(existing);
    }
  }

  private async findRoutesByModuleId(moduleId: string) {
    const links =
      await this.moduleRouteRepository.findActiveByModuleId(moduleId);
    const routeIds = links.map((link) => link.route_id);

    if (!routeIds.length) {
      return [];
    }

    return this.routeQueryRepository.findActiveByExternalIds(routeIds);
  }

  private async ensureModuleExists(moduleId: string): Promise<void> {
    const moduleEntity = await this.moduleRepository.findByExternalId(moduleId);
    if (!moduleEntity) {
      throw new NotFoundException("Módulo não encontrado.");
    }
  }

  private async ensureRoutesExist(routeIds: string[]): Promise<void> {
    if (!routeIds.length) {
      return;
    }

    const routes =
      await this.routeQueryRepository.findActiveByExternalIds(routeIds);

    if (routes.length !== routeIds.length) {
      throw new BadRequestException(
        "Uma ou mais rotas informadas não existem ou estão inativas.",
      );
    }
  }
}
