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
    auth/                # password hasher, JWT payload
    users/               # usuários, validação de senha, 2FA
    sessions/            # login e emissão de token
    permissions/         # CRUD de permissões
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
  main.ts
```

Aliases TypeScript: `@application/*`, `@config/*`, `@infra/*`, `@modules/*`.

## Autenticação e 2FA

- Senhas hasheadas com Scrypt (`PasswordHasher`).
- Cadastro exige senha forte (`@IsSecurePassword`).
- `two_factor_is_enabled: true` gera secret TOTP via `otplib` e persiste no banco; o secret **não** é aceito nem retornado na API.
- Validação do código TOTP no login ainda não implementada.

## Documentação

- [Índice da documentação](./docs/README.md)
- [Arquitetura](./docs/diagrams/architecture.md)
- [ERD PostgreSQL](./docs/diagrams/postgres-erd.md)

## Licença

MIT
