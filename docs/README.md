# Documentação

Documentação técnica da `permissions.api`.

## Conteúdo

| Documento | Descrição |
|-----------|-----------|
| [architecture.md](./diagrams/architecture.md) | Módulos Nest, camadas e integrações |
| [postgres-erd.md](./diagrams/postgres-erd.md) | Modelo relacional (PostgreSQL) |

## API (Swagger)

Com a aplicação rodando:

- UI: `http://localhost:5000/api`
- Autenticação na UI: botão **Authorize** → `Bearer <access_token>` (token de `POST /sessions`)

## Contextos de aplicação (`src/application`)

| Contexto | Responsabilidade |
|----------|------------------|
| `auth` | Portas compartilhadas (`PasswordHasher`), tipo `JwtPayload` |
| `users` | CRUD de usuários, senha forte, geração de secret 2FA |
| `sessions` | Login e emissão de JWT |
| `permissions` | CRUD de permissões |

Cada contexto expõe DTOs, ports, services e tokens de injeção via `index.ts`.

## Operação local

```bash
docker compose up -d          # Postgres + Redis
pnpm run migration:run
pnpm run start:dev
```

## Migrations

| Comando | Ação |
|---------|------|
| `pnpm run migration:generate -- <nome>` | Gera migration a partir das entities |
| `pnpm run migration:run` | Aplica pendentes |
| `pnpm run migration:revert` | Reverte a última |
| `pnpm run schema:drop` | Remove schema (cuidado) |

Script: `scripts/generate-migration.ts`  
CLI TypeORM: `src/infra/database/typeorm/data-source.ts`

## Diagramas

- [Arquitetura](./diagrams/architecture.md)
- [PostgreSQL ERD](./diagrams/postgres-erd.md)
