# Diagrama de arquitetura

Visão geral da **Todo Lists API** (`permissions.api`): domínio de todo-lists (private/public, itens aninhados) com auth JWT e RBAC (permissão → módulo → rota).

## Fluxo HTTP

```mermaid
flowchart LR
  Client[Cliente] --> API[NestJS API]
  API --> Swagger["/api — Swagger"]
  API --> Sessions["POST /sessions"]
  API --> Users["/users"]
  API --> Permissions["/permissions"]
  API --> Modules["/modules"]
  API --> ModuleRoutes["/modules/:moduleId/routes"]
  API --> PermissionModules["/permissions/:permissionId/modules"]
  API --> TodoLists["/todo-lists"]
  Sessions --> JWT[JWT]
  Users --> JWT
  Permissions --> JWT
  Modules --> JWT
  ModuleRoutes --> JWT
  PermissionModules --> JWT
  TodoLists --> JWT
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
  AppModule --> ModulesModule[ModulesModule]

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
    PaginationCtx[common/pagination]
    AuthCtx[auth]
    UsersCtx[users]
    SessionsCtx[sessions]
    PermissionsCtx[permissions]
    ModulesCtx[modules]
    ModuleRoutesCtx[module-routes]
    PermissionModulesCtx[permission-modules]
    TodoListsCtx[todo-lists]
    TodoItemsCtx[todo-items]
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
| `todo-lists` | `TodoListService` | `/todo-lists` |
| `todo-items` | `TodoItemService` | `/todo-lists/:listId/items` |
| `sessions` | `SessionService` | `POST /sessions` |
| `users` | `UserService` | `/users` |
| `permissions` | `PermissionService` | `/permissions` |
| `modules` | `ModuleService` | `/modules` |
| `module-routes` | `ModuleRoutesService` | `/modules/:moduleId/routes` |
| `permission-modules` | `PermissionModulesService` | `/permissions/:permissionId/modules` |

Listagens paginadas (`GET` em coleções) usam `common/pagination` para query params e envelope `{ data, meta }`.

`AuthModule` concentra JWT, `JwtAuthGuard`, `PasswordHasher` e repositório de usuários usado no login.

## Infraestrutura de dados

- Entities: `module`, `route`, `permission`, `user`, `module_route`, `permission_module`, `todo_list`, `todo_item`
- Migrations via TypeORM CLI (`data-source.ts`)
- Logs do ORM desabilitados (`logging: false`)
- `synchronize: false` — schema apenas via migrations

## Scripts e CLI

- `scripts/generate-migration.ts` — wrapper para gerar migrations
- `pnpm run start:dev` — Nest watch (SWC) + `tsc-alias` para path aliases

## Modelo de autorização

```mermaid
flowchart LR
  User[Usuário autenticado] --> Permission[permission_id no JWT]
  Permission --> PM[permission_module]
  PM --> Module[module]
  Module --> MR[module_route]
  MR --> Route[route method+path]
  Route --> Guard[PermissionsGuard]
```

`module` representa um bloco funcional do front (página, botão, componente, seção etc).  
Se a permissão do usuário estiver vinculada a um ou mais módulos, ele acessa todas as rotas associadas a esses módulos.
