import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PASSWORD_HASHER } from "@application/auth";
import {
  SESSION_SERVICE,
  SessionService,
} from "@application/sessions";
import {
  USER_REPOSITORY,
  USER_SERVICE,
  UserService,
} from "@application/users";
import { AppConfigService } from "@config/app-config.service";
import { ScryptPasswordHasherService } from "@infra/auth/scrypt-password-hasher.service";
import { RouteEntity } from "@infra/database/entities/route.entity";
import { UserEntity } from "@infra/database/entities/user.entity";
import { TypeOrmUserRepository } from "@infra/database/repositories/typeorm-user.repository";
import { PermissionsModule } from "@modules/permissions/permissions.module";

import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PermissionsGuard } from "./guards/permissions.guard";
import { PermissionRoutesService } from "./services/permission-routes.service";

@Module({
  imports: [
    forwardRef(() => PermissionsModule),
    TypeOrmModule.forFeature([UserEntity, RouteEntity]),
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => ({
        secret: appConfigService.auth.jwt_secret,
        signOptions: { expiresIn: appConfigService.auth.jwt_expires_in },
      }),
    }),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: ScryptPasswordHasherService,
    },
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
    {
      provide: SESSION_SERVICE,
      useClass: SessionService,
    },
    PermissionRoutesService,
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    forwardRef(() => PermissionsModule),
    USER_SERVICE,
    SESSION_SERVICE,
    JwtModule,
    JwtAuthGuard,
    PermissionsGuard,
    PermissionRoutesService,
    PASSWORD_HASHER,
    USER_REPOSITORY,
  ],
})
export class AuthModule {}
