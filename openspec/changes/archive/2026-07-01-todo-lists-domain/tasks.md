## 1. Database & Entities



- [x] 1.1 Criar `TodoListEntity` e `TodoItemEntity` em `src/infra/database/entities/` (FKs por `external_id`, soft delete, `is_public`, `position`)

- [x] 1.2 Registrar entities no `data-source.ts` e gerar migration (`pnpm run migration:generate -- TodoLists`)

- [x] 1.3 Aplicar migration localmente e validar schema no Postgres



## 2. Repositories (infra)



- [x] 2.1 Criar ports `TodoListRepositoryPort` e `TodoItemRepositoryPort` em `application/`

- [x] 2.2 Implementar `typeorm-todo-list.repository.ts` e `typeorm-todo-item.repository.ts`

- [x] 2.3 Registrar providers no módulo Nest e exportar tokens de injeção



## 3. Application — todo-lists



- [x] 3.1 Criar DTOs (`CreateTodoListDto`, `UpdateTodoListDto`, `TodoListResponseDto`) com Swagger

- [x] 3.2 Implementar `TodoListService` com regras de ownership e visibilidade (404 para privada alheia)

- [x] 3.3 Implementar `findMine`, `findPublic`, `findById`, `create`, `update`, `remove` (soft delete em cascata dos itens)

- [x] 3.4 Criar mapper `toTodoListResponseDto` (incluir owner em listas públicas)

- [x] 3.5 Testes unitários do `TodoListService`



## 4. Application — todo-items



- [x] 4.1 Criar DTOs (`CreateTodoItemDto`, `UpdateTodoItemDto`, `TodoItemResponseDto`)

- [x] 4.2 Implementar `TodoItemService` reutilizando checagem de acesso da lista pai

- [x] 4.3 Implementar `findByListId`, `create`, `update`, `remove`

- [x] 4.4 Testes unitários do `TodoItemService`



## 5. HTTP Module



- [x] 5.1 Criar `TodoListsController` (`GET /todo-lists`, `GET /todo-lists/public`, `POST`, `GET/:id`, `PATCH/:id`, `DELETE/:id`)

- [x] 5.2 Criar `TodoItemsController` (rotas aninhadas em `/todo-lists/:listId/items`)

- [x] 5.3 Criar `TodoListsModule`, registrar guards (`JwtAuthGuard`, `PermissionsGuard`) e importar em `AppModule`

- [x] 5.4 Garantir ordem de rotas (`/public` antes de `/:id`) e decorators Swagger/`@ApiBearerAuth`



## 6. Autorização & Documentação



- [x] 6.1 Verificar registro automático das rotas via `RouteSyncService` após boot

- [x] 6.2 Documentar módulos sugeridos (`TODO_LIST_READ`, `TODO_LIST_WRITE`, `TODO_ITEM_READ`, `TODO_ITEM_WRITE`) no README/docs

- [x] 6.3 Atualizar ERD em `docs/diagrams/postgres-erd.md`



## 7. Testes E2E



- [x] 7.1 E2E: owner cria lista privada e lista itens

- [x] 7.2 E2E: owner marca lista como pública; outro user lê lista e itens

- [x] 7.3 E2E: outro user recebe 404 em lista privada e 403 ao tentar editar lista pública alheia

- [x] 7.4 E2E: delete de lista remove acesso aos itens



## 8. OpenSpec archive



- [x] 8.1 Rodar `openspec validate todo-lists-domain`

- [ ] 8.2 Após merge, arquivar change com `openspec archive todo-lists-domain` e sincronizar specs principais


