import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { UserRepositoryPort } from "@application/users";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { email },
      withDeleted: false,
    });
  }

  findByExternalId(externalId: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { external_id: externalId } });
  }

  findAll(): Promise<UserEntity[]> {
    return this.repository.find();
  }

  save(user: UserEntity): Promise<UserEntity> {
    return this.repository.save(user);
  }

  create(data: Partial<UserEntity>): UserEntity {
    return this.repository.create(data);
  }

  merge(user: UserEntity, data: Partial<UserEntity>): UserEntity {
    return this.repository.merge(user, data);
  }

  async softDeleteByExternalId(externalId: string): Promise<boolean> {
    const result = await this.repository.softDelete({
      external_id: externalId,
    });
    return Boolean(result.affected);
  }
}
