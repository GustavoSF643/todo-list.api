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
```

## Estrutura do projeto

```text
src/
  config/
    app.config.ts
    app-config.service.ts
    config.module.ts
  infra/
    database/
      database.module.ts
      typeorm/
        typeorm.config.ts
      entities/
      migrations/
  app.module.ts
  main.ts
```

## Diretrizes de arquitetura

- `config/`: centraliza leitura/validação de variáveis e exposição tipada via `AppConfigService`.
- `infra/database/`: encapsula integração com TypeORM e evolução de schema (migrations).
- `app.module.ts`: composição dos módulos de aplicação.

## Roadmap inicial

- adicionar primeiras entidades e migrations reais
- incluir CI para `lint`, `build` e `test`
- adicionar documentação de endpoints (Swagger)

## Licença

MIT
