# Diagrama PostgreSQL (ERD)

Modelo relacional com base nas entities TypeORM. Todas as tabelas de domínio estendem `BaseEntity`:

- `id` — `SERIAL` (PK interna)
- `external_id` — `UUID` (identificador exposto na API)

```mermaid
erDiagram
  module {
    INT id PK
    UUID external_id UK
    VARCHAR name UK
    VARCHAR description
    VARCHAR module_key UK
    BOOLEAN is_active
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  route {
    INT id PK
    UUID external_id UK
    ENUM method
    VARCHAR path UK
    BOOLEAN is_active
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  permission {
    INT id PK
    UUID external_id UK
    VARCHAR name UK
    BOOLEAN is_active
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  user {
    INT id PK
    UUID external_id UK
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
    INT id PK
    UUID external_id UK
    UUID module_id FK
    UUID route_id FK
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  permission_module {
    INT id PK
    UUID external_id UK
    UUID permission_id FK
    UUID module_id FK
    TIMESTAMP created_at
    TIMESTAMP updated_at
    TIMESTAMP deleted_at
  }

  permission ||--o{ user : "permission_id → external_id"
  module ||--o{ module_route : "module_id → external_id"
  route ||--o{ module_route : "route_id → external_id"
  permission ||--o{ permission_module : "permission_id → external_id"
  module ||--o{ permission_module : "module_id → external_id"
```

## Observações

- **Soft delete:** `deleted_at` preenchido indica registro removido logicamente.
- **`route.method`:** enum `RouteMethodEnum` (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`).
- **FKs na API:** referências usam `external_id` (UUID), não o `id` serial.
- **Usuário / 2FA:** `two_factor_secret` é gerado pelo servidor (`otplib`) quando `two_factor_is_enabled` é `true`; não é enviado nem exposto em respostas JSON.
- **Módulos e rotas:** entities mapeadas; endpoints HTTP para `module` / `route` ainda não implementados.

## Migration inicial

`1778701122908-initial_migration.ts` — cria o schema acima com extensão `uuid-ossp`.
