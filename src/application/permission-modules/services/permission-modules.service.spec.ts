import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import type { PermissionRepositoryPort } from "@application/permissions";
import { PERMISSION_REPOSITORY } from "@application/permissions";
import type { ModuleEntity } from "@infra/database/entities/module.entity";
import type { PermissionModuleEntity } from "@infra/database/entities/permission-module.entity";
import type { ModuleQueryRepositoryPort } from "../ports/module-query.repository.port";
import type { PermissionModuleRepositoryPort } from "../ports/permission-module.repository.port";
import {
  MODULE_QUERY_REPOSITORY,
  PERMISSION_MODULE_REPOSITORY,
} from "../tokens/injection-tokens";
import { PermissionModulesService } from "./permission-modules.service";

const PERMISSION_ID = "11111111-1111-4111-8111-111111111111";
const MODULE_A = "22222222-2222-4222-8222-222222222222";
const MODULE_B = "33333333-3333-4333-8333-333333333333";

const makeModule = (externalId: string): ModuleEntity =>
  ({
    external_id: externalId,
    name: "Users",
    module_key: "USERS",
    is_active: true,
  }) as ModuleEntity;

describe("PermissionModulesService", () => {
  let service: PermissionModulesService;
  let permissionRepository: jest.Mocked<PermissionRepositoryPort>;
  let permissionModuleRepository: jest.Mocked<PermissionModuleRepositoryPort>;
  let moduleQueryRepository: jest.Mocked<ModuleQueryRepositoryPort>;

  beforeEach(async () => {
    permissionRepository = {
      findByExternalId: jest.fn(),
      findByName: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
      existsByExternalId: jest.fn(),
      isSuperAdmin: jest.fn(),
    };

    permissionModuleRepository = {
      findActiveByPermissionId: jest.fn(),
      findActiveByPermissionIdPaginated: jest.fn(),
      findByPermissionIdAndModuleId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDeleteAllByPermissionId: jest.fn(),
      softDeleteByPermissionIdAndModuleId: jest.fn(),
      restore: jest.fn(),
    };

    moduleQueryRepository = {
      findActiveByExternalIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionModulesService,
        { provide: PERMISSION_REPOSITORY, useValue: permissionRepository },
        {
          provide: PERMISSION_MODULE_REPOSITORY,
          useValue: permissionModuleRepository,
        },
        { provide: MODULE_QUERY_REPOSITORY, useValue: moduleQueryRepository },
      ],
    }).compile();

    service = module.get(PermissionModulesService);
  });

  it("lists modules linked to permission", async () => {
    permissionRepository.findByExternalId.mockResolvedValue({} as never);
    permissionModuleRepository.findActiveByPermissionIdPaginated.mockResolvedValue(
      {
        items: [{ module_id: MODULE_A } as PermissionModuleEntity],
        total: 1,
      },
    );
    moduleQueryRepository.findActiveByExternalIds.mockResolvedValue([
      makeModule(MODULE_A),
    ]);

    const result = await service.listByPermissionId(PERMISSION_ID, {});

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(MODULE_A);
  });

  it("sync replaces permission-module links", async () => {
    permissionRepository.findByExternalId.mockResolvedValue({} as never);
    moduleQueryRepository.findActiveByExternalIds.mockResolvedValue([
      makeModule(MODULE_A),
      makeModule(MODULE_B),
    ]);
    permissionModuleRepository.findByPermissionIdAndModuleId.mockResolvedValue(
      null,
    );
    permissionModuleRepository.create.mockImplementation(
      (data) => data as PermissionModuleEntity,
    );
    permissionModuleRepository.save.mockResolvedValue(
      {} as PermissionModuleEntity,
    );
    permissionModuleRepository.findActiveByPermissionId.mockResolvedValue([
      { module_id: MODULE_A } as PermissionModuleEntity,
      { module_id: MODULE_B } as PermissionModuleEntity,
    ]);
    moduleQueryRepository.findActiveByExternalIds
      .mockResolvedValueOnce([makeModule(MODULE_A), makeModule(MODULE_B)])
      .mockResolvedValueOnce([makeModule(MODULE_A), makeModule(MODULE_B)]);

    await service.sync(PERMISSION_ID, { module_ids: [MODULE_A, MODULE_B] });

    expect(
      permissionModuleRepository.softDeleteAllByPermissionId,
    ).toHaveBeenCalledWith(PERMISSION_ID);
    expect(permissionModuleRepository.save).toHaveBeenCalledTimes(2);
  });

  it("throws when module does not exist on sync", async () => {
    permissionRepository.findByExternalId.mockResolvedValue({} as never);
    moduleQueryRepository.findActiveByExternalIds.mockResolvedValue([
      makeModule(MODULE_A),
    ]);

    await expect(
      service.sync(PERMISSION_ID, { module_ids: [MODULE_A, MODULE_B] }),
    ).rejects.toThrow(BadRequestException);
  });

  it("throws not found when unlink does not exist", async () => {
    permissionRepository.findByExternalId.mockResolvedValue({} as never);
    permissionModuleRepository.softDeleteByPermissionIdAndModuleId.mockResolvedValue(
      false,
    );

    await expect(service.remove(PERMISSION_ID, MODULE_A)).rejects.toThrow(
      NotFoundException,
    );
  });
});
