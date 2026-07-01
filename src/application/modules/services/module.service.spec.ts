import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import type { ModuleEntity } from "@infra/database/entities/module.entity";
import type { ModuleRepositoryPort } from "../ports/module.repository.port";
import { MODULE_REPOSITORY } from "../tokens/injection-tokens";
import { ModuleService } from "./module.service";

const makeModule = (partial: Partial<ModuleEntity> = {}): ModuleEntity =>
  ({
    id: 1,
    external_id: "11111111-1111-4111-8111-111111111111",
    name: "Usuários",
    description: "Operações relacionadas ao cadastro de usuários",
    module_key: "USERS",
    is_active: true,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...partial,
  }) as ModuleEntity;

describe("ModuleService", () => {
  let service: ModuleService;
  let moduleRepository: jest.Mocked<ModuleRepositoryPort>;

  beforeEach(async () => {
    moduleRepository = {
      findByExternalId: jest.fn(),
      findByName: jest.fn(),
      findByModuleKey: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        { provide: MODULE_REPOSITORY, useValue: moduleRepository },
      ],
    }).compile();

    service = module.get(ModuleService);
  });

  it("creates module when name and key are unique", async () => {
    const payload = {
      name: "Usuários",
      description: "Operações relacionadas ao cadastro de usuários",
      module_key: "USERS",
      is_active: true,
    };

    const createdModule = makeModule();
    moduleRepository.findByName.mockResolvedValue(null);
    moduleRepository.findByModuleKey.mockResolvedValue(null);
    moduleRepository.create.mockReturnValue(createdModule);
    moduleRepository.save.mockResolvedValue(createdModule);

    const result = await service.create(payload);

    expect(moduleRepository.create).toHaveBeenCalledWith(payload);
    expect(result.name).toBe("Usuários");
    expect(result.module_key).toBe("USERS");
  });

  it("lists all modules", async () => {
    moduleRepository.findAllPaginated.mockResolvedValue({
      items: [makeModule()],
      total: 1,
    });

    const result = await service.findAll({});

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Usuários");
    expect(result.meta.total).toBe(1);
  });

  it("finds module by external id", async () => {
    moduleRepository.findByExternalId.mockResolvedValue(makeModule());

    const result = await service.findByExternalId(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(result.id).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("throws not found when module does not exist", async () => {
    moduleRepository.findByExternalId.mockResolvedValue(null);

    await expect(
      service.findByExternalId("00000000-0000-4000-8000-000000000000"),
    ).rejects.toThrow(NotFoundException);
  });

  it("updates module when unique constraints pass", async () => {
    const existingModule = makeModule();
    const updatedModule = makeModule({ name: "Usuários Atualizado" });

    moduleRepository.findByExternalId.mockResolvedValue(existingModule);
    moduleRepository.findByName.mockResolvedValue(null);
    moduleRepository.findByModuleKey.mockResolvedValue(null);
    moduleRepository.merge.mockReturnValue(updatedModule);
    moduleRepository.save.mockResolvedValue(updatedModule);

    const result = await service.update(
      "11111111-1111-4111-8111-111111111111",
      { name: "Usuários Atualizado" },
    );

    expect(result.name).toBe("Usuários Atualizado");
    expect(moduleRepository.merge).toHaveBeenCalledWith(existingModule, {
      name: "Usuários Atualizado",
    });
  });

  it("removes module by external id", async () => {
    moduleRepository.softDeleteByExternalId.mockResolvedValue(true);

    await service.remove("11111111-1111-4111-8111-111111111111");

    expect(moduleRepository.softDeleteByExternalId).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("throws not found when remove fails", async () => {
    moduleRepository.softDeleteByExternalId.mockResolvedValue(false);

    await expect(
      service.remove("00000000-0000-4000-8000-000000000000"),
    ).rejects.toThrow(NotFoundException);
  });

  it("throws conflict when name already exists", async () => {
    moduleRepository.findByName.mockResolvedValue(makeModule());

    await expect(
      service.create({
        name: "Usuários",
        module_key: "USERS",
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("throws conflict when module key already exists", async () => {
    moduleRepository.findByName.mockResolvedValue(null);
    moduleRepository.findByModuleKey.mockResolvedValue(makeModule());

    await expect(
      service.create({
        name: "Usuários",
        module_key: "USERS",
      }),
    ).rejects.toThrow(ConflictException);
  });
});
