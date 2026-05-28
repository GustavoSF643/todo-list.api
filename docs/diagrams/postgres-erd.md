# Diagrama PostgreSQL (ERD)

Modelo atual do banco PostgreSQL com base nas entidades mapeadas via TypeORM.

```mermaid
erDiagram
  module {
    UUID id PK
    VARCHAR name UK
    VARCHAR description
    VARCHAR module_key UK
    BOOLEAN is_active
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  route {
    UUID id PK
    ENUM method
    VARCHAR path UK
    BOOLEAN is_active
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  permission {
    UUID id PK
    VARCHAR name UK
    BOOLEAN is_active
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  user {
    UUID id PK
    VARCHAR first_name
    VARCHAR last_name
    VARCHAR email UK
    VARCHAR password
    BOOLEAN two_factor_is_enabled
    VARCHAR two_factor_secret
    UUID permission_id FK
    BOOLEAN is_active
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  module_route {
    UUID id PK
    UUID module_id FK
    UUID route_id FK
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  permission_module {
    UUID id PK
    UUID permission_id FK
    UUID module_id FK
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  permission ||--o{ user : "permission_id"
  module ||--o{ module_route : "module_id"
  route ||--o{ module_route : "route_id"
  permission ||--o{ permission_module : "permission_id"
  module ||--o{ permission_module : "module_id"
```

## Observacoes

- Todas as tabelas usam `id` como chave primaria (`uuid` gerado automaticamente).
- Campos `deleted_at` indicam soft delete quando preenchidos.
- `route.method` usa enum `RouteMethodEnum` (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`).
