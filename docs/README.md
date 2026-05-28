# Documentacao

Esta pasta centraliza a documentacao tecnica do projeto.

## Conteudo

- `diagrams/architecture.md`: visao da arquitetura da API e seus modulos centrais.
- `diagrams/postgres-erd.md`: visao ERD das tabelas atuais mapeadas com TypeORM.

## Operacao

- Gerar migration: `npm run migration:generate -- <nome-da-migration>`
- Executar migrations pendentes: `npm run migration:run`
- Reverter ultima migration executada: `npm run migration:revert`
- Script responsavel: `scripts/generate-migration.ts`

## Diagramas

- [Arquitetura](./diagrams/architecture.md)
- [PostgreSQL ERD](./diagrams/postgres-erd.md)
