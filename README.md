# Permissions API

API de permissões e autenticação construída com NestJS, organizada por camadas (`application`, `infra`, `modules`) e contextos de domínio.

## Tecnologias

- Node.js 20+
- NestJS 11
- TypeORM + PostgreSQL
- JWT (`@nestjs/jwt`)
- Swagger (`@nestjs/swagger`)
- TOTP (`otplib`) para 2FA
- Redis opcional (cache)
- Zod (validação de ambiente)
- pnpm, SWC (build), ESLint + Prettier

## Requisitos

- `node >= 20`
- `pnpm >= 9`
- Docker (recomendado para Postgres e Redis)

## Quick start

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm run migration:run
pnpm run start:dev
```

- API: `http://localhost:5000`
- Swagger: `http://localhost:5000/api`

## Variáveis de ambiente

Veja `.env.example`. Principais grupos:

| Grupo | Variáveis |
|-------|-----------|
| App | `PORT`, `NODE_ENV`, `APP_NAME` |
| Auth | `JWT_SECRET`, `JWT_EXPIRES_IN` |
| Database | `POSTGRES_*` |
| Cache | `REDIS_URL` (opcional; vazio = cache em memória) |

## Scripts

```bash
# aplicação
pnpm run start:dev
pnpm run build
pnpm run start:prod

# qualidade
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run test

# migrations
pnpm run migration:generate -- <nome>
pnpm run migration:run
pnpm run migration:revert
```

## Endpoints

| Tag | Base | Autenticação |
|-----|------|----------------|
| `sessions` | `POST /sessions` | Público (login) |
| `users` | `/users` | JWT (exceto `POST /users`) |
| `permissions` | `/permissions` | JWT |
| `modules` | `/modules` | JWT |
| `module-routes` | `/modules/:moduleId/routes` | JWT |
| `permission-modules` | `/permissions/:permissionId/modules` | JWT |
| `todo-lists` | `/todo-lists` | JWT |

### Paginação em listagens (breaking change)

Todos os endpoints `GET` que retornam coleções usam o envelope `{ data, meta }` em vez de um array na raiz.

| Query | Padrão | Regra |
|-------|--------|-------|
| `page` | `1` | Inteiro ≥ 1; inválido → `400` |
| `limit` | `20` | Inteiro ≥ 1; valores acima de `100` são limitados a `100` (sem erro) |

`meta`: `{ page, limit, total, total_pages }`.

Endpoints paginados:

- `GET /users`
- `GET /permissions`
- `GET /modules`
- `GET /permissions/:permissionId/modules`
- `GET /modules/:moduleId/routes`
- `GET /todo-lists`
- `GET /todo-lists/public`
- `GET /todo-lists/:listId/items`

`PUT`/`POST` de vínculos (`/permissions/:id/modules`, `/modules/:id/routes`) continuam retornando array completo após sync/add.

### Módulos sugeridos (todo-lists)

| module_key | Rotas |
|------------|-------|
| `TODO_LIST_READ` | `GET /todo-lists`, `GET /todo-lists/public`, `GET /todo-lists/:id` |
| `TODO_LIST_WRITE` | `POST /todo-lists`, `PATCH /todo-lists/:id`, `DELETE /todo-lists/:id` |
| `TODO_ITEM_READ` | `GET /todo-lists/:listId/items` |
| `TODO_ITEM_WRITE` | `POST /todo-lists/:listId/items`, `PATCH /todo-lists/:listId/items/:itemId`, `DELETE /todo-lists/:listId/items/:itemId` |

Vincule as rotas aos módulos via `PUT /modules/:moduleId/routes` e os módulos à permissão via `PUT /permissions/:permissionId/modules`.

Regras de domínio (além do `PermissionsGuard`):

- Cada lista pertence a um usuário (`user_id`).
- `is_public: false` — só o owner lê/edita.
- `is_public: true` — outros usuários autenticados podem **ler** lista e itens; apenas o owner **edita**.

Fluxo sugerido:

1. `POST /permissions` — criar permissão
2. `POST /users` — cadastrar usuário (informar `permission_id`)
3. `POST /sessions` — login (`email`, `password`) → `access_token`
4. Demais rotas com header `Authorization: Bearer <token>`

Detalhes de payloads e schemas: Swagger em `/api`.

## Estrutura do projeto

```text
src/
  application/           # regras de negócio por contexto
    common/pagination/   # DTOs e helpers de paginação
    auth/                # password hasher, JWT payload
    users/               # usuários, validação de senha, 2FA
    sessions/            # login e emissão de token
    permissions/         # CRUD de permissões
    modules/             # CRUD de módulos
    todo-lists/          # listas de tarefas por usuário
    todo-items/          # itens de listas
    module-routes/       # vínculo módulo ↔ rotas
    permission-modules/  # vínculo permissão ↔ módulos
  config/                # env tipado (Zod + AppConfigService)
  infra/
    auth/                # Scrypt password hasher
    cache/               # Redis ou in-memory
    database/            # TypeORM, entities, migrations, repositories
  modules/               # controllers e wiring Nest
    auth/                # JwtModule, guards, providers compartilhados
    users/
    sessions/
    permissions/
    modules/
    todo-lists/
  main.ts
```

Aliases TypeScript: `@application/*`, `@config/*`, `@infra/*`, `@modules/*`.

## Autenticação e 2FA

- Senhas hasheadas com Scrypt (`PasswordHasher`).
- Cadastro exige senha forte (`@IsSecurePassword`).
- `two_factor_is_enabled: true` gera secret TOTP via `otplib` e persiste no banco; o secret **não** é aceito nem retornado na API.
- Validação do código TOTP no login ainda não implementada.

## Modelo de autorização por módulos

- Um **módulo** representa qualquer bloco do front que possa ser bloqueado: página, botão, seção, componente, card etc.
- O módulo é vinculado às rotas backend em `module_route`.
- A permissão do usuário é vinculada aos módulos em `permission_module`.
- Se o usuário tiver uma permissão com **um ou mais módulos vinculados**, ele terá acesso a **todas as rotas** associadas a esses módulos.
- O `PermissionsGuard` resolve acesso por `method + path` com base nessa cadeia:

```text
permission -> permission_module -> module -> module_route -> route
```

### Endpoints de vínculo

- `GET/PUT/POST/DELETE /modules/:moduleId/routes`
- `GET/PUT/POST/DELETE /permissions/:permissionId/modules`

Use `PUT` para sincronização completa dos vínculos e `POST` para adicionar sem remover os existentes.

## Documentação

- [Índice da documentação](./docs/README.md)
- [Arquitetura](./docs/diagrams/architecture.md)
- [ERD PostgreSQL](./docs/diagrams/postgres-erd.md)

## Licença

MIT
