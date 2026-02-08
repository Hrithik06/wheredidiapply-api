// Loads .env for Prisma CLI
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // where migration files are stored
  migrations: {
    path: "prisma/migrations",
    // Allows you to run 'pnpm prisma db seed' using tsx
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // VERY IMPORTANT:
    // CLI commands (migrate, pull, push) MUST use the un-pooled direct connection
    url: env("DIRECT_URL"),
  },
});
