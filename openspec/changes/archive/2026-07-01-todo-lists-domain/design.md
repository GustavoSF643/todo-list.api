## Context

A `permissions.api` já expõe autenticação JWT (`POST /sessions`), usuários e autorização por módulos/rotas. O front `todo.permissions` precisará persistir listas e itens no backend. O padrão de código existente separa regras em `application/`, persistência em `infra/database/` e HTTP em `modules/`, com `external_id` UUID na API e soft delete.

## Goals / Non-Goals

**Goals:**

- Persistir listas de tarefas vinculadas a um `user` (owner via `user_id` → `user.external_id`).
- Suportar visibilidade `is_public`: privada (só owner) ou pública (leitura por outros usuários autenticados).
- Persistir itens aninhados em cada lista com CRUD restrito ao owner.
- Expor endpoints documentados no Swagger e registrados no `RouteSyncService`.
- Integrar com `PermissionsGuard` (acesso à rota) + checagem de ownership no service.

**Non-Goals:**

- Front-end, colaboração multi-editor, comentários, anexos.
- Leitura anônima de listas públicas.

## Decisions

### 1. Dois contextos de aplicação: `todo-lists` e `todo-items`

**Decisão:** contextos separados em `src/application/todo-lists` e `src/application/todo-items`, com um único `TodoListsModule` Nest agregando controllers.

**Alternativa considerada:** um único contexto `todos` — rejeitado para manter services menores e alinhados ao padrão `modules` / `module-routes`.

### 2. Modelo relacional

```text
todo_list
  id, external_id (UUID)
  user_id (UUID FK → user.external_id)  -- owner
  title (varchar 255)
  description (varchar 255, optional)
  is_public (boolean, default false)
  created_at, updated_at, deleted_at

todo_item
  id, external_id (UUID)
  todo_list_id (UUID FK → todo_list.external_id)
  title (varchar 255)
  completed (boolean, default false)
  position (int, default 0)  -- ordenação estável
  created_at, updated_at, deleted_at
```

**Visibilidade:**

| Operação | Owner | Outro user (lista privada) | Outro user (lista pública) |
|----------|-------|----------------------------|----------------------------|
| Ler lista/itens | ✅ | ❌ 403 | ✅ leitura |
| Criar/editar/remover lista | ✅ | ❌ | ❌ |
| Criar/editar/remover itens | ✅ | ❌ | ❌ |

A checagem de ownership usa `JwtPayload.sub` (UUID do user) comparado a `todo_list.user_id`.

### 3. Endpoints REST

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/todo-lists` | Listas do usuário autenticado |
| `GET` | `/todo-lists/public` | Listas públicas de outros users (exclui as do próprio user) |
| `POST` | `/todo-lists` | Criar lista (owner = user do JWT) |
| `GET` | `/todo-lists/:id` | Detalhe; owner ou pública |
| `PATCH` | `/todo-lists/:id` | Atualizar (owner); permite alternar `is_public` |
| `DELETE` | `/todo-lists/:id` | Soft delete (owner) |
| `GET` | `/todo-lists/:listId/items` | Itens; mesma regra de leitura da lista |
| `POST` | `/todo-lists/:listId/items` | Criar item (owner) |
| `PATCH` | `/todo-lists/:listId/items/:itemId` | Atualizar item (owner) |
| `DELETE` | `/todo-lists/:listId/items/:itemId` | Remover item (owner) |

`GET /todo-lists/public` fica **antes** de `GET /todo-lists/:id` no controller para evitar conflito de rota.

### 4. Autorização em duas camadas

1. **`PermissionsGuard`** — usuário precisa ter a rota vinculada ao seu `permission_id` via módulos (como hoje).
2. **Service de domínio** — valida ownership e visibilidade (`ForbiddenException` / `NotFoundException`).

Módulos sugeridos para seed/documentação:

| module_key | Rotas típicas |
|------------|---------------|
| `TODO_LIST_READ` | GET listas (own + public + detail) |
| `TODO_LIST_WRITE` | POST/PATCH/DELETE listas |
| `TODO_ITEM_READ` | GET itens |
| `TODO_ITEM_WRITE` | POST/PATCH/DELETE itens |

Super admin (`is_super_admin`) continua com bypass no guard.

### 5. Respostas da API

DTOs espelham entities sem expor `id` serial. Listas públicas incluem dados mínimos do owner (`owner: { id, first_name, last_name }`) para exibição no front.

### 6. Estrutura de arquivos

```text
src/application/todo-lists/   # dto, ports, service, mapper, tokens
src/application/todo-items/
src/infra/database/entities/todo-list.entity.ts
src/infra/database/entities/todo-item.entity.ts
src/infra/database/repositories/typeorm-todo-list.repository.ts
src/infra/database/repositories/typeorm-todo-item.repository.ts
src/modules/todo-lists/
  todo-lists.controller.ts
  todo-items.controller.ts
  todo-lists.module.ts
```

Registrar `TodoListsModule` em `app.module.ts`. Entities no `data-source` para migrations.

## Risks / Trade-offs

- **[Risco] Dupla autorização confusa (módulo vs ownership)** → Documentar no Swagger e README; erros distintos (403 guard vs 403 domínio).
- **[Risco] Listagem pública sem paginação** → Aceitar para MVP; adicionar `limit/offset` em change futura se necessário.
- **[Risco] `GET /todo-lists/:id` vaza existência de lista privada** → Retornar `404` para não-owner em lista privada (não revelar que existe).
- **[Trade-off] Itens não replicam `is_public`** → Herdam visibilidade da lista pai; simplifica modelo.

## Migration Plan

1. Gerar migration com entities `todo_list` e `todo_item`.
2. Deploy API; `RouteSyncService` registra novas rotas no boot.
3. Criar módulos e vínculos `module_route` / `permission_module` manualmente ou via seed script.
4. Rollback: `migration:revert` remove tabelas; rotas órfãs podem ser desativadas via `is_active`.

## Open Questions

- Incluir seed de módulos/rotas nesta change ou documentar apenas no README? _(Sugestão: README + exemplo curl; seed opcional em task separada.)_
- Paginação em `GET /todo-lists/public` no MVP? _(Sugestão: não, adiar.)_
