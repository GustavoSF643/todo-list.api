import type { UserEntity } from "@infra/database/entities/user.entity";

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByExternalId(externalId: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  save(user: UserEntity): Promise<UserEntity>;
  create(data: Partial<UserEntity>): UserEntity;
  merge(user: UserEntity, data: Partial<UserEntity>): UserEntity;
  softDeleteByExternalId(externalId: string): Promise<boolean>;
}
