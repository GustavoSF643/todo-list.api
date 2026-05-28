import { execSync } from "node:child_process";

const migrationName = process.argv[2];

if (!migrationName) {
  console.error("Informe o nome da migration. Ex: npm run migration:generate -- create-user-table");
  process.exit(1);
}

try {
  execSync(
    `pnpm exec ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -d src/infra/database/typeorm/data-source.ts src/infra/database/migrations/${migrationName}`,
    { stdio: "inherit" },
  );
} catch (error) {
  const message = error instanceof Error ? error.message : "Erro desconhecido";
  console.error("Erro ao gerar migration:", message);
  process.exit(1);
}
