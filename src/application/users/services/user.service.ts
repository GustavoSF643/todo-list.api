import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type { PasswordHasher } from "@application/auth";
import { PASSWORD_HASHER } from "@application/auth";
import {
  parsePaginationQuery,
  toPaginatedResponse,
  type PaginationQueryDto,
} from "@application/common/pagination";
import {
  PERMISSION_REPOSITORY,
  type PermissionRepositoryPort,
} from "@application/permissions";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserResponseDto } from "../dto/user-response.dto";
import { toUserResponseDto } from "../mappers/user-response.mapper";
import type { UserRepositoryPort } from "../ports/user.repository.port";
import type { UserServicePort } from "../ports/user.service.port";
import { USER_REPOSITORY } from "../tokens/injection-tokens";
import { resolveTwoFactorFields } from "../utils/resolve-two-factor-fields";

@Injectable()
export class UserService implements UserServicePort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async create(payload: CreateUserDto): Promise<UserResponseDto> {
    await this.ensureEmailIsUnique(payload.email);
    await this.ensurePermissionExists(payload.permission_id);

    const { password, ...userData } = payload;
    const user = this.userRepository.create({
      ...userData,
      ...resolveTwoFactorFields(payload),
      password: this.passwordHasher.hash(password),
    });

    const createdUser = await this.userRepository.save(user);
    return toUserResponseDto(createdUser);
  }

  async findAll(query: PaginationQueryDto) {
    const pagination = parsePaginationQuery(query);
    const { items, total } = await this.userRepository.findAllPaginated(
      pagination.skip,
      pagination.take,
    );
    return toPaginatedResponse(
      items.map((user) => toUserResponseDto(user)),
      total,
      pagination,
    );
  }

  async findByExternalId(externalId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByExternalId(externalId);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    return toUserResponseDto(user);
  }

  async update(
    externalId: string,
    payload: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findByExternalId(externalId);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    if (payload.email && payload.email !== user.email) {
      await this.ensureEmailIsUnique(payload.email);
    }

    if (payload.permission_id) {
      await this.ensurePermissionExists(payload.permission_id);
    }

    const { password, ...userData } = payload;
    const entityToSave = this.userRepository.merge(user, {
      ...userData,
      ...resolveTwoFactorFields(payload, user),
      password: password ? this.passwordHasher.hash(password) : user.password,
    });

    const updatedUser = await this.userRepository.save(entityToSave);
    return toUserResponseDto(updatedUser);
  }

  async remove(externalId: string): Promise<void> {
    const wasDeleted =
      await this.userRepository.softDeleteByExternalId(externalId);

    if (!wasDeleted) {
      throw new NotFoundException("Usuário não encontrado.");
    }
  }

  private async ensureEmailIsUnique(email: string): Promise<void> {
    const userWithSameEmail = await this.userRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new ConflictException("Já existe usuário com este e-mail.");
    }
  }

  private async ensurePermissionExists(permissionId: string): Promise<void> {
    const permissionExists =
      await this.permissionRepository.existsByExternalId(permissionId);

    if (!permissionExists) {
      throw new NotFoundException("Permissão não encontrada.");
    }
  }
}
