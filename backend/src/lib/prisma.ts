import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DB_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DB_URL (or DATABASE_URL) for PrismaClient initialization");
}

// Prisma 7+ needs an explicit driver adapter.
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

