import * as z from "zod";

export const envValidationSchema = z.object({
  // app
  PORT: z.string().default("5000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // auth
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("3600"),

  // database
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DATABASE: z.string(),
  POSTGRES_SSL: z.string().default("false"),

  REDIS_URL: z.preprocess((val) => {
    if (val === undefined || val === "") return undefined;
    if (typeof val === "string" && val.trim() === "") return undefined;
    return val;
  }, z.url().optional()),
});
