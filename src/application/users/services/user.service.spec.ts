import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { PASSWORD_HASHER, type PasswordHasher } from "@application/auth";
import {
  PERMISSION_REPOSITORY,
  type PermissionRepositoryPort,
} from "@application/permissions";
import type { UserEntity } from "@infra/database/entities/user.entity";
import type { UserRepositoryPort } from "../ports/user.repository.port";
import { USER_REPOSITORY } from "../tokens/injection-tokens";
import { UserService } from "./user.service";

const makeUser = (partial: Partial<UserEntity> = {}): UserEntity =>
  ({
    id: 1,
    external_id: "11111111-1111-1111-1111-111111111111",
    permission_id: "22222222-2222-2222-2222-222222222222",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    password: "hashed-password",
    two_factor_is_enabled: false,
    two_factor_secret: null,
    is_active: true,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...partial,
  }) as UserEntity;

describe("UserService", () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let permissionRepository: jest.Mocked<PermissionRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      findByExternalId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
    };

    permissionRepository = {
      findByExternalId: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
      existsByExternalId: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: PERMISSION_REPOSITORY, useValue: permissionRepository },
        { provide: PASSWORD_HASHER, useValue: passwordHasher },
      ],
    }).compile();

    service = module.get(UserService);
  });

  it("creates user with hashed password", async () => {
    const payload = {
      permission_id: "22222222-2222-2222-2222-222222222222",
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      password: "PlainPass123!",
      two_factor_is_enabled: false,
      is_active: true,
    };

    const created = makeUser();
    userRepository.findByEmail.mockResolvedValue(null);
    permissionRepository.existsByExternalId.mockResolvedValue(true);
    passwordHasher.hash.mockReturnValue("hashed-password");
    userRepository.create.mockReturnValue(created);
    userRepository.save.mockResolvedValue(created);

    const result = await service.create(payload);

    expect(passwordHasher.hash).toHaveBeenCalledWith("PlainPass123!");
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "john@example.com",
        password: "hashed-password",
        two_factor_secret: null,
      }),
    );
    expect(result.email).toBe("john@example.com");
  });

  it("throws conflict when email already exists", async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    await expect(
      service.create({
        permission_id: "22222222-2222-2222-2222-222222222222",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "PlainPass123!",
      }),
    ).rejects.toThrow(ConflictException);
  });

  it("throws not found when updating unknown user", async () => {
    userRepository.findByExternalId.mockResolvedValue(null);

    await expect(
      service.update("unknown-id", { first_name: "Jane" }),
    ).rejects.toThrow(NotFoundException);
  });

  it("throws not found when remove fails", async () => {
    userRepository.softDeleteByExternalId.mockResolvedValue(false);

    await expect(service.remove("missing-id")).rejects.toThrow(NotFoundException);
  });
});
