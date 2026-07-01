## Context

A API expõe oito endpoints de listagem que retornam arrays completos. O design do `todo-lists-domain` adiou paginação para uma change futura. O front ainda não consome a API — janela ideal para breaking change consistente em todo o projeto.

## Goals / Non-Goals

**Goals:**

- Paginação uniforme `page`/`limit` em todas as listagens.
- Defaults: `page=1`, `limit=20` quando query params ausentes.
- `limit` > 100 → truncar para `100` silenciosamente.
- Resposta padronizada `{ data: T[], meta: PaginationMeta }`.
- Helper reutilizável para parse de query, clamp e montagem de meta.

**Non-Goals:**

- Cursor-based pagination.
- Ordenação configurável via query (manter ordenação atual de cada domínio).

## Decisions

### 1. Query parameters

| Param | Default | Regras |
|-------|---------|--------|
| `page` | `1` | Inteiro ≥ 1; inválido → `400` |
| `limit` | `20` | Inteiro ≥ 1; se > 100 → **clamp 100** |

`offset` calculado internamente: `(page - 1) * limit`.

### 2. Response envelope

```typescript
{
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }
}
```

`total_pages = Math.ceil(total / limit)` (mínimo 0 quando `total === 0`).

### 3. Shared application layer

```text
src/application/common/pagination/
  pagination-query.dto.ts      # @ApiPropertyOptional page, limit
  pagination-meta.dto.ts
  paginated-response.dto.ts    # generic factory for Swagger
  parse-pagination-query.ts  # defaults + clamp + validation
  build-pagination-meta.ts
```

`parsePaginationQuery(query)` retorna `{ page, limit, skip, take }`.

### 4. Repository pattern

Estender ports com métodos paginados ou parâmetro opcional:

```typescript
findAllPaginated(pagination: PaginationParams): Promise<PaginatedResult<Entity>>
```

`PaginatedResult<T> = { items: T[]; total: number }`.

Manter ordenação existente por domínio:
- users, permissions, modules → `created_at DESC` (ou ordem atual)
- todo-lists → `created_at DESC`
- todo-items → `position ASC`, `created_at ASC`
- permission-modules, module-routes → ordem atual do repository

### 5. Endpoints (breaking)

| Endpoint | Service method |
|----------|----------------|
| `GET /users` | `userService.findAll` |
| `GET /permissions` | `permissionService.findAll` |
| `GET /modules` | `moduleService.findAll` |
| `GET /permissions/:permissionId/modules` | `permissionModulesService.listByPermissionId` |
| `GET /modules/:moduleId/routes` | `moduleRoutesService.listByModuleId` |
| `GET /todo-lists` | `todoListService.findMine` |
| `GET /todo-lists/public` | `todoListService.findPublic` |
| `GET /todo-lists/:listId/items` | `todoItemService.findByListId` |

Controllers recebem `@Query() pagination: PaginationQueryDto` e retornam `PaginatedResponseDto`.

### 6. Swagger

Usar `@ApiOkResponse` com schema do envelope. Documentar query params com `@ApiQuery` opcionais.

### 7. Validação

- `page` < 1 ou não inteiro → `400 Bad Request`
- `limit` < 1 ou não inteiro → `400 Bad Request`
- `limit` > 100 → clamp (sem 400)

## Risks / Trade-offs

- **[Breaking]** Clientes que esperam array na raiz quebram → documentar no README; front ainda não publicado.
- **[Clamp silencioso]** Cliente pode não perceber que pediu 500 e recebeu 100 → aceitável por decisão do produto.
- **[Count queries]** Cada listagem executa `COUNT(*)` extra → aceitável no volume atual; otimizar depois se necessário.

## Migration Plan

1. Implementar helpers/DTOs compartilhados.
2. Migrar contextos um a um (users → permissions → modules → vínculos → todo-lists).
3. Atualizar testes e Swagger.
4. Documentar breaking change no README.

## Open Questions

- Nenhuma — decisões fechadas pelo produto (escopo total, page/limit, defaults, clamp 100).
