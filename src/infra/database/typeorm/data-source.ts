import { DataSource } from "typeorm";

const parseBoolean = (value: string | undefined): boolean =>
  value === "true" || value === "1";

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? "postgres",
  password: process.env.POSTGRES_PASSWORD ?? "postgres",
  database: process.env.POSTGRES_DATABASE ?? "permissions",
  ssl: parseBoolean(process.env.POSTGRES_SSL),
  entities: [__dirname + "/../entities/*{.ts,.js}"],
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  synchronize: false,
  logging: true,
});
