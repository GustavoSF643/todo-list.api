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
| `modules` | CRUD de módulos (blocos funcionais do front) |
| `module-routes` | Vínculo entre módulo e rotas (`module_route`) |
| `permission-modules` | Vínculo entre permissão e módulos (`permission_module`) |
| `todo-lists` | CRUD de listas de tarefas por usuário (`is_public`) |
| `todo-items` | CRUD de itens aninhados em listas |
| `common/pagination` | DTOs e helpers compartilhados (`page`/`limit`, envelope `{ data, meta }`) |

Cada contexto expõe DTOs, ports, services e tokens de injeção via `index.ts`.

## Paginação em listagens

Endpoints `GET` que retornam coleções respondem com `{ data, meta }` (não array na raiz).

| Query | Padrão | Regra |
|-------|--------|-------|
| `page` | `1` | Inteiro ≥ 1 |
| `limit` | `20` | Inteiro ≥ 1; máximo efetivo `100` (clamp silencioso) |

`meta`: `{ page, limit, total, total_pages }`. Detalhes e lista completa de rotas: [README do projeto](../README.md#paginação-em-listagens-breaking-change).


## Regra de acesso por módulos

- Módulo representa um bloco de interface que pode ser restrito (página, botão, componente, seção, etc).
- O vínculo `permission_module` define quais módulos uma permissão possui.
- O vínculo `module_route` define quais rotas pertencem a cada módulo.
- Usuário autenticado com uma permissão que possua módulos vinculados recebe acesso a todas as rotas desses módulos.

## Branches e CI

| Branch | Uso |
|--------|-----|
| `main` | Produção / releases estáveis |
| `development` | Integração contínua; base para PRs de features |

O workflow **CI** roda em push e pull request para `main` e `development`.

### Proteção de branches (GitHub)

Configure em **Settings → Branches → Add branch protection rule**:

**`main`**

- Require a pull request before merging
- Require status checks to pass: job `test` (workflow CI)
- Do not allow bypassing the above settings

**`development`** (opcional, mais leve)

- Require status checks to pass: job `test`

Fluxo sugerido: `feature/*` → PR para `development` → PR de `development` para `main`.

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
