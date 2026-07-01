## Why

O front `todo.permissions` precisa de um backend real para listas de tarefas, com dono definido e visibilidade configurável. Hoje a API cobre apenas autenticação e autorização por módulos; sem um domínio de todo-lists, o front ficaria com estado local e regras de compartilhamento inconsistentes. Implementar esse domínio na `permissions.api` centraliza persistência, validação e controle de acesso antes da UI.

## What Changes

- Novo contexto de aplicação `todo-lists` com CRUD de listas vinculadas a um `user` (owner).
- Campo `is_public` em cada lista: privada (só o owner acessa) ou pública (outros usuários autenticados podem ler).
- Novo contexto `todo-items` (ou sub-recurso) com itens aninhados em cada lista (`title`, `completed`, ordenação).
- Regras de negócio: apenas o owner cria, edita e remove listas e itens; leitura de listas públicas permitida a qualquer usuário autenticado com permissão de módulo adequada.
- Novas entities, migration, repositories, controllers e documentação Swagger.
- Novas rotas sincronizadas via `RouteSyncService` e vinculáveis a módulos de permissão existentes.
- Testes unitários dos services e e2e dos endpoints principais.

## Non-goals

- Implementação do front Next.js (`todo.permissions`) nesta change.
- Compartilhamento colaborativo (outros users editando listas públicas).
- Comentários, tags, anexos ou notificações em tarefas.
- Listas públicas sem autenticação (acesso anônimo).

## Capabilities

### New Capabilities

- `todo-lists`: CRUD de listas de tarefas por usuário, com visibilidade `private` / `public` e regras de leitura/escrita por ownership.
- `todo-items`: CRUD de itens dentro de uma lista, com restrição de escrita ao owner da lista pai.

### Modified Capabilities

- _(nenhuma — specs existentes de auth/permissions/modules permanecem; apenas novas rotas serão vinculáveis via `module_route`)_

## Impact

- **Banco:** novas tabelas `todo_list` e `todo_item` (migration TypeORM).
- **Código:** `src/application/todo-lists`, `src/application/todo-items`, entities/repositories, `src/modules/todo-lists`.
- **API:** novos endpoints sob `/todo-lists` e `/todo-lists/:listId/items` (paths finais no design).
- **Autorização:** novas rotas registradas no `route`; módulos sugeridos (`TODO_LIST_*`, `TODO_ITEM_*`) devem ser criados e vinculados às permissões; `PermissionsGuard` continua validando method+path — regras de ownership ficam no service/guard de domínio.
- **Consumidores:** `todo.permissions` passará a consumir estes endpoints após implementação.
- **Breaking:** nenhum endpoint existente é alterado.
