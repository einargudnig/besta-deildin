import { config } from "dotenv";

config();

export const env = {
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "database_url",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
