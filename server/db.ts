import 'dotenv/config';
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 20, // Increase the connection limit
  queueLimit: 0, // No limit on the number of queued connection requests
  waitForConnections: true, // Wait for connections to be available
});

export const db = drizzle(pool, { schema, mode: 'default' });