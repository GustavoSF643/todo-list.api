# Diagrama de arquitetura

Visão geral da `permissions.api`.

## Fluxo HTTP

```mermaid
flowchart LR
  Client[Cliente] --> API[NestJS API]
  API --> Swagger["/api — Swagger"]
  API --> Sessions["POST /sessions"]
  API --> Users["/users"]
  API --> Permissions["/permissions"]
  Sessions --> JWT[JWT]
  Users --> JWT
  Permissions --> JWT
  API --> Postgres[(PostgreSQL)]
  API --> Redis[(Redis opcional)]
```

## Módulos Nest

```mermaid
flowchart TD
  Main[main.ts] --> AppModule[AppModule]
  AppModule --> ConfigModule[AppConfigModule]
  AppModule --> DatabaseModule[DatabaseModule]
  AppModule --> CacheModule[CacheInfraModule]
  AppModule --> AuthModule[AuthModule]
  AppModule --> UsersModule[UsersModule]
  AppModule --> SessionsModule[SessionsModule]
  AppModule --> PermissionsModule[PermissionsModule]

  UsersModule --> AuthModule
  SessionsModule --> AuthModule
  PermissionsModule --> AuthModule

  AuthModule --> JwtModule[JwtModule]
  AuthModule --> UserProviders[User + Session providers]
  PermissionsModule --> PermissionProviders[Permission providers]

  DatabaseModule --> TypeORM[TypeORM]
  TypeORM --> Postgres[(PostgreSQL)]
```

## Camadas

```mermaid
flowchart TB
  subgraph modules [modules/]
    Controllers[Controllers HTTP]
  end

  subgraph application [application/]
    AuthCtx[auth]
    UsersCtx[users]
    SessionsCtx[sessions]
    PermissionsCtx[permissions]
  end

  subgraph infra [infra/]
    Repos[TypeORM repositories]
    Hasher[ScryptPasswordHasher]
    Cache[Cache Redis / memory]
  end

  Controllers --> application
  application --> infra
  Repos --> DB[(PostgreSQL)]
```

## Contextos de domínio

| Contexto | Service | Rotas |
|----------|---------|-------|
| `sessions` | `SessionService` | `POST /sessions` |
| `users` | `UserService` | `/users` |
| `permissions` | `PermissionService` | `/permissions` |

`AuthModule` concentra JWT, `JwtAuthGuard`, `PasswordHasher` e repositório de usuários usado no login.

## Infraestrutura de dados

- Entities: `module`, `route`, `permission`, `user`, `module_route`, `permission_module`
- Migrations via TypeORM CLI (`data-source.ts`)
- Logs do ORM desabilitados (`logging: false`)
- `synchronize: false` — schema apenas via migrations

## Scripts e CLI

- `scripts/generate-migration.ts` — wrapper para gerar migrations
- `pnpm run start:dev` — Nest watch (SWC) + `tsc-alias` para path aliases
