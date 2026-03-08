import { PrismaClient } from "../generated/prisma/client.js";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/*
  We keep ONE Prisma instance for the entire server.

  Why?
  In development nodemon restarts files often.
  Without this, every restart opens new DB connections
  until Supabase rejects you.
*/
/**
 * globalThis prevents multiple Prisma instances during development 'hot reloads'.
 * Without this, every file save would open 5 new connections until Supabase crashes.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/*
  pg.Pool:
  - does NOT replace Supabase pooling
  - only keeps a few TCP sockets open
  - reduces latency of new queries
*/
// Use the POOLED connection for the application runtime (DATABASE_URL:pooled connection string Supabase)

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,

  // CRITICAL for Supabase
  // Prevents exhausting connection limits
  // Keep this low on Supabase Free Tier (max 20 total usually)
  max: 5,

  idleTimeoutMillis: 30000,
});

/*
  Prisma adapter:
  Prisma now generates SQL only.
  pg actually sends SQL to database.
*/
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn"], // Useful for debugging your SQL
  });

// prevent duplicate clients in dev hot reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
