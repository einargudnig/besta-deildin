import { config } from "dotenv";

config();

export const env = {
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "database_url",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_USER: process.env.DATABASE_USER || "user",
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || "password",
  DATABASE_HOST: process.env.DATABASE_HOST || "localhost",
  DATABASE_PORT: process.env.DATABASE_PORT || "5432",
  DATABASE_NAME: process.env.DATABASE_NAME || "dbname",
};
