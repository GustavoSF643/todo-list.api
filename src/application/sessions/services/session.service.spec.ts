import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

import { PASSWORD_HASHER, type PasswordHasher } from "@application/auth";
import type { UserRepositoryPort } from "@application/users";
import { USER_REPOSITORY } from "@application/users";
import { AppConfigService } from "@config/app-config.service";
import type { UserEntity } from "@infra/database/entities/user.entity";
import { SessionService } from "./session.service";

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

describe("SessionService", () => {
  let service: SessionService;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn(),
      findByExternalId: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      softDeleteByExternalId: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: PASSWORD_HASHER, useValue: passwordHasher },
        { provide: JwtService, useValue: jwtService },
        {
          provide: AppConfigService,
          useValue: { auth: { jwt_expires_in: 3600 } },
        },
      ],
    }).compile();

    service = module.get(SessionService);
  });

  it("throws unauthorized when user is not found", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.create({ email: "john@example.com", password: "PlainPass123!" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("throws unauthorized when password is invalid", async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());
    passwordHasher.compare.mockReturnValue(false);

    await expect(
      service.create({ email: "john@example.com", password: "wrong-pass" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("returns access token and mapped user on success", async () => {
    const user = makeUser();
    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.compare.mockReturnValue(true);
    jwtService.signAsync.mockResolvedValue("jwt-token");

    const result = await service.create({
      email: "john@example.com",
      password: "PlainPass123!",
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.external_id,
      email: user.email,
      permission_id: user.permission_id,
    });
    expect(result).toEqual(
      expect.objectContaining({
        access_token: "jwt-token",
        token_type: "Bearer",
        expires_in: 3600,
      }),
    );
    expect(result.user.email).toBe("john@example.com");
  });
});
