"scripts": {
  "dev": "tsx watch src/index.ts",

  "build": "tsc",
  "start": "node dist/index.js",

  "test": "vitest",

  /* ---------- PRISMA ---------- */

  // create migration + apply to DB
  "db:migrate": "prisma migrate dev",

  // regenerate client after schema changes
  "db:generate": "prisma generate",

  // pull schema from existing DB (rarely used)
  "db:pull": "prisma db pull",

  // run seed manually
  "db:seed": "prisma db seed",

  // 🔥 MOST IMPORTANT DEV COMMAND
  // reset DB + rerun migrations + seed
  "db:reset": "prisma migrate reset"
}
