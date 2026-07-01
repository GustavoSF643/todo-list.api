## 1. Shared pagination layer

- [x] 1.1 Criar `PaginationQueryDto`, `PaginationMetaDto`, `PaginatedResponseDto` em `src/application/common/pagination/`
- [x] 1.2 Implementar `parsePaginationQuery` (defaults `page=1`, `limit=20`, clamp `limit` em 100, validação `400`)
- [x] 1.3 Implementar `buildPaginationMeta` e helper `toPaginatedResponse`

## 2. Users

- [x] 2.1 Adicionar `findAllPaginated` no repository/service de users
- [x] 2.2 Atualizar `GET /users` para aceitar `@Query()` e retornar envelope paginado
- [x] 2.3 Testes unitários e e2e

## 3. Permissions

- [x] 3.1 Adicionar paginação em `permissionService.findAll` + repository
- [x] 3.2 Atualizar `GET /permissions`
- [x] 3.3 Testes

## 4. Modules

- [x] 4.1 Adicionar paginação em `moduleService.findAll` + repository
- [x] 4.2 Atualizar `GET /modules`
- [x] 4.3 Testes

## 5. Permission modules & module routes

- [x] 5.1 Paginar `listByPermissionId` em permission-modules
- [x] 5.2 Paginar `listByModuleId` em module-routes
- [x] 5.3 Atualizar controllers e testes

## 6. Todo-lists & todo-items

- [x] 6.1 Paginar `findMine`, `findPublic` em todo-lists
- [x] 6.2 Paginar `findByListId` em todo-items
- [x] 6.3 Atualizar controllers, specs de resposta Swagger
- [x] 6.4 Testes unitários e e2e (incluindo clamp e defaults)

## 7. Documentação

- [x] 7.1 Documentar breaking change e query params no README
- [x] 7.2 Atualizar exemplos Swagger (`@ApiQuery`, `@ApiOkResponse`)

## 8. OpenSpec

- [x] 8.1 `openspec validate listing-pagination`
- [ ] 8.2 Após merge: `openspec archive listing-pagination`
