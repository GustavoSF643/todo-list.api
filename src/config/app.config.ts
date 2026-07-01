import { ConfigType, registerAs } from "@nestjs/config";

export const appConfig = registerAs("appConfig", () => ({
  app: {
    name: process.env.APP_NAME || "Todo Lists API — Auth & RBAC",
    port: parseInt(process.env.PORT || "5000"),
    node_env: process.env.NODE_ENV || "development",
  },
  auth: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: parseInt(process.env.JWT_EXPIRES_IN || "3600"),
  },
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    ssl: process.env.POSTGRES_SSL === "true",
  },
  redis: {
    url: (() => {
      const url = process.env.REDIS_URL?.trim();
      return url && url.length > 0 ? url : undefined;
    })(),
  },
}));

export const configs = [appConfig];

export type AppConfig = ConfigType<typeof appConfig>;
