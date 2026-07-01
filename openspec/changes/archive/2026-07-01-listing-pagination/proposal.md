## Why

Todas as listagens da API retornam arrays completos sem limite, o que não escala e dificulta o front (`todo.permissions`) implementar tabelas paginadas. Antes de consumir a API no client, padronizar paginação em todo o projeto evita inconsistência e retrabalho.

## What Changes

- **BREAKING:** endpoints de listagem passam a retornar envelope `{ data, meta }` em vez de array na raiz.
- Query params opcionais `page` (default `1`) e `limit` (default `20`) em todos os `GET` que listam coleções.
- `limit` acima de `100` é **truncado para `100`** (sem erro).
- DTOs compartilhados: `PaginationQueryDto`, `PaginationMetaDto`, `PaginatedResponseDto<T>`.
- Repositories/services de cada contexto passam a usar `take`/`skip` + `count`.
- Endpoints afetados:
  - `GET /users`
  - `GET /permissions`
  - `GET /modules`
  - `GET /permissions/:permissionId/modules`
  - `GET /modules/:moduleId/routes`
  - `GET /todo-lists`
  - `GET /todo-lists/public`
  - `GET /todo-lists/:listId/items`
- Testes unitários, e2e e Swagger atualizados.

## Non-goals

- Paginação por cursor (`cursor`/`nextCursor`).
- Paginação em endpoints que retornam item único (`GET /:id`).
- Alterar regras de autorização ou ownership.
- Paginação no front (change separada em `todo.permissions`).

## Capabilities

### New Capabilities

- `listing-pagination`: contrato global de paginação (`page`/`limit`, defaults, clamp, envelope de resposta) aplicado a todos os endpoints de listagem do projeto.

### Modified Capabilities

- `todo-lists`: requisitos de listagem (`GET /todo-lists`, `GET /todo-lists/public`) passam a resposta paginada.
- `todo-items`: requisito de listagem (`GET /todo-lists/:listId/items`) passa a resposta paginada.

## Impact

- **API:** breaking change em 8 rotas de listagem; mesmos paths e guards (`JwtAuthGuard`, `PermissionsGuard`).
- **Código:** `src/application/common/` (ou `shared/`) para DTOs/helpers; todos os contextos com `findAll`/`list*`.
- **OpenAPI:** schemas de resposta alterados; cliente gerado no front precisará regenerar após esta change.
- **Autorização:** rotas inalteradas no `RouteSyncService`; módulos existentes continuam válidos.
