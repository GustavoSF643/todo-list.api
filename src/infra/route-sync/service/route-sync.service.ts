import { Injectable, Logger, RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";

import { RouteMethodEnum } from "@infra/database/enums";
import { TypeOrmRouteRepository } from "@infra/database/repositories/typeorm-route.repository";
import { buildRoutePath } from "../utils/build-route-path";

@Injectable()
export class RouteSyncService {
  private readonly logger = new Logger(RouteSyncService.name);

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly routeRepository: TypeOrmRouteRepository,
  ) {}

  async syncRoutes(): Promise<void> {
    const controllers = this.discovery.getControllers();
    const routes: Array<{ method: RouteMethodEnum; path: string }> = [];

    for (const wrapper of controllers) {
      const metatype = wrapper.metatype;
      const instance = wrapper.instance as object | undefined;
      if (!metatype || !instance) {
        continue;
      }

      const controllerPath =
        this.reflector.get<string>(PATH_METADATA, metatype) ?? "";

      const prototype = Object.getPrototypeOf(instance) as object;
      const methodNames = this.scanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const handler = prototype[methodName as keyof typeof prototype];
        if (typeof handler !== "function") {
          continue;
        }

        const routePath =
          this.reflector.get<string>(PATH_METADATA, handler) ?? "";
        const requestMethod = this.reflector.get<RequestMethod>(
          METHOD_METADATA,
          handler,
        );

        if (requestMethod === undefined) {
          continue;
        }

        const methodKey = RequestMethod[
          requestMethod
        ] as keyof typeof RouteMethodEnum;
        const method = RouteMethodEnum[methodKey];
        if (!method) {
          continue;
        }

        routes.push({
          method,
          path: buildRoutePath(controllerPath, routePath),
        });
      }
    }

    const uniqueRoutes = [
      ...new Map(
        routes.map((route) => [`${route.method}:${route.path}`, route]),
      ).values(),
    ];

    await this.routeRepository.bulkUpsert(uniqueRoutes);
    this.logger.log(`Rotas sincronizadas: ${uniqueRoutes.length}`);
  }
}
