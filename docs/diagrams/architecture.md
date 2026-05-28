# Diagrama de Arquitetura

Visao geral da estrutura atual da `permissions.api`.

```mermaid
flowchart TD
  Client[Cliente HTTP] --> Main[main.ts]
  Main --> AppModule[AppModule]
  AppModule --> ConfigModule[ConfigModule]
  AppModule --> DatabaseModule[DatabaseModule]
  Scripts[Scripts CLI] --> TypeOrmDataSource[TypeORM DataSource CLI]

  ConfigModule --> AppConfigService[AppConfigService]
  DatabaseModule --> TypeOrmConfig[TypeORM Config]
  TypeOrmConfig --> Postgres[(PostgreSQL)]
  TypeOrmDataSource --> Postgres
  DatabaseModule --> Entities[Entities]
  DatabaseModule --> Enums[Enums]

  Entities --> ModuleEntity[ModuleEntity]
  Entities --> RouteEntity[RouteEntity]
  Entities --> PermissionEntity[PermissionEntity]
  Entities --> UserEntity[UserEntity]
  Entities --> ModuleRouteEntity[ModuleRouteEntity]
  Entities --> PermissionModuleEntity[PermissionModuleEntity]

  Enums --> RouteMethodEnum[RouteMethodEnum]
```

## Observacoes

- O modulo de configuracao concentra leitura e validacao das variaveis de ambiente.
- O modulo de banco encapsula configuracao do TypeORM, mapeamento das entidades e enums de persistencia.
- A geracao de migrations usa script em `scripts/` e um `data-source` dedicado para o TypeORM CLI.
- As entidades representam tabelas base (`module`, `route`, `permission`, `user`) e tabelas de associacao (`module_route`, `permission_module`).
