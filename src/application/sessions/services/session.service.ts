import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import type { PasswordHasher } from "@application/auth";
import { PASSWORD_HASHER } from "@application/auth";
import {
  toUserResponseDto,
  USER_REPOSITORY,
  type UserRepositoryPort,
} from "@application/users";
import { AppConfigService } from "@config/app-config.service";
import { CreateSessionDto } from "../dto/create-session.dto";
import { SessionResponseDto } from "../dto/session-response.dto";
import type { SessionServicePort } from "../ports/session.service.port";

@Injectable()
export class SessionService implements SessionServicePort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async create(payload: CreateSessionDto): Promise<SessionResponseDto> {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user || !user.password) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    const isValidPassword = this.passwordHasher.compare(
      payload.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.external_id,
      email: user.email,
      permission_id: user.permission_id,
    });

    return {
      user: toUserResponseDto(user),
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: this.appConfigService.auth.jwt_expires_in,
    };
  }
}
