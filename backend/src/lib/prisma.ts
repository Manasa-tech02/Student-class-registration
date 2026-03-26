import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DB_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DB_URL (or DATABASE_URL) for PrismaClient initialization");
}

// Prisma needs an explicit driver adapter when using Prisma's adapter-based runtime.
// We create a real pg.Pool so connection/max-timeout settings are respected.
const pool = new pg.Pool({
  connectionString,
  max: 10,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  // Neon/Postgres over TLS: ensure the driver negotiates SSL.
  // We disable certificate verification because Neon typically provides valid certs,
  // and this prevents connectivity issues from SSL verification quirks.
  ssl: { rejectUnauthorized: false },
});

export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

