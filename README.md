# Permissions API

API de permissões construída com `NestJS` e `TypeScript`, com configuração tipada e infraestrutura de banco organizada por camadas.

## Tecnologias

- `Node.js` 20+
- `NestJS` 11
- `TypeORM`
- `PostgreSQL`
- `Zod` para validação de ambiente
- `ESLint` + `Prettier`

## Requisitos

- `node >= 20`
- `npm >= 10`
- instância PostgreSQL disponível

## Quick Start

```bash
npm install
cp .env.example .env
npm run start:dev
```

Aplicação padrão: `http://localhost:5000`.

## Variáveis de ambiente

```env
# APP
PORT=5000
NODE_ENV=development

# AUTH
JWT_SECRET=secret

# DATABASE
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=permissions
POSTGRES_SSL=false
```

## Scripts

```bash
# app
npm run start
npm run start:dev
npm run build
npm run start:prod

# qualidade
npm run lint
npm run lint:fix
npm run format
npm run format:check

# testes
npm run test
npm run test:e2e
npm run test:cov

# migrations
npm run migration:generate -- <nome-da-migration>
npm run migration:run
npm run migration:revert
```

Exemplo:

```bash
npm run migration:generate -- initial_migration
```

## Estrutura do projeto

```text
scripts/
  generate-migration.ts

src/
  config/
    app.config.ts
    app-config.service.ts
    config.module.ts
  infra/
    database/
      database.module.ts
      enums/
        route-method.enum.ts
        index.ts
      typeorm/
        typeorm.config.ts
        data-source.ts
      entities/
      migrations/
  app.module.ts
  main.ts
```

## Documentacao

- Guia de documentacao: `docs/README.md`
- Diagrama de arquitetura: `docs/diagrams/architecture.md`
- Diagrama PostgreSQL (ERD): `docs/diagrams/postgres-erd.md`

## Diretrizes de arquitetura

- `config/`: centraliza leitura/validação de variáveis e exposição tipada via `AppConfigService`.
- `infra/database/`: encapsula integração com TypeORM e evolução de schema (migrations).
- `scripts/`: automações de linha de comando para tarefas operacionais do projeto.
- `infra/database/entities/`: mapeia tabelas principais (`module`, `route`, `permission`, `user`) e tabelas de associação (`module_route`, `permission_module`).
- `infra/database/enums/`: concentra enums reutilizáveis usados no mapeamento de entidades.
- `infra/database/typeorm/data-source.ts`: configuração específica para o TypeORM CLI (geração/execução de migrations).
- `app.module.ts`: composição dos módulos de aplicação.

## Roadmap inicial

- adicionar migrations para consolidar o schema atual
- incluir CI para `lint`, `build` e `test`
- adicionar documentação de endpoints (Swagger)

## Licença

MIT
