import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type OrderStatus = "to_prepare" | "preparing" | "ready";

const demoOrders = [
  ["MLC-8042", "Valentina R.", "Traje de ceremonia · Marfil", "3-6 Meses", "2026-11-08", "ready"],
  ["MLC-8043", "Nicolás P.", "Traje clásico · Azul marino", "2A", "2026-11-08", "preparing"],
  ["MLC-8044", "Camila M.", "Traje de bautizo · Blanco", "0-3 Meses", "2026-11-04", "to_prepare"],
  ["MLC-8045", "Andrés G.", "Traje slim · Grafito", "4A", "2026-11-05", "to_prepare"],
  ["MLC-8046", "Josefina T.", "Traje de ceremonia · Rosa", "6-9 Meses", "2026-11-06", "preparing"],
  ["MLC-8047", "Diego C.", "Traje clásico · Negro", "3A", "2026-11-09", "to_prepare"],
  ["MLC-8048", "Fernanda S.", "Traje de bautizo · Marfil", "9-12 Meses", "2026-11-11", "to_prepare"],
  ["MLC-8049", "Tomás V.", "Traje slim · Azul marino", "5A", "2026-11-12", "to_prepare"],
  ["MLC-8050", "María J.", "Traje clásico · Grafito", "12-18 Meses", "2026-11-13", "to_prepare"],
  ["MLC-8051", "Pablo L.", "Traje de ceremonia · Azul", "5A", "2026-11-16", "to_prepare"],
  ["MLC-8052", "Antonia F.", "Traje clásico · Verde", "2A", "2026-11-18", "to_prepare"],
  ["MLC-8053", "Sebastián B.", "Traje slim · Negro", "3-6 Meses", "2026-11-20", "preparing"],
  ["MLC-8054", "Isidora N.", "Traje de bautizo · Blanco", "4A", "2026-11-23", "to_prepare"],
  ["MLC-8055", "Matías D.", "Traje clásico · Azul marino", "6-9 Meses", "2026-11-25", "to_prepare"],
  ["MLC-8056", "Emilia O.", "Traje slim · Grafito", "5A", "2026-11-27", "to_prepare"],
] as const;

export async function initializeDatabase() {
  let connected = false;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      connected = true;
      break;
    } catch (error) {
      if (attempt === 9) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
  if (!connected) throw new Error("No se pudo conectar con PostgreSQL.");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dispatch_orders (
      id TEXT PRIMARY KEY,
      buyer TEXT NOT NULL,
      product TEXT NOT NULL,
      size TEXT NOT NULL CHECK (size IN ('0-3 Meses', '3-6 Meses', '6-9 Meses', '9-12 Meses', '12-18 Meses', '2A', '3A', '4A', '5A')),
      dispatch_date DATE NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('to_prepare', 'preparing', 'ready')),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM dispatch_orders");
  if (Number(rows[0]?.count) === 0) {
    for (const [id, buyer, product, size, dispatchDate, status] of demoOrders) {
      await pool.query(
        `INSERT INTO dispatch_orders (id, buyer, product, size, dispatch_date, status)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [id, buyer, product, size, dispatchDate, status],
      );
    }
  }
}
