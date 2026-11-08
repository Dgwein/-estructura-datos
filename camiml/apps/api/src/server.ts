import Fastify from "fastify";
import cors from "@fastify/cors";
import { initializeDatabase, OrderStatus, pool } from "./db.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
});

app.get("/health", async () => ({ status: "ok", service: "camiml-api" }));

app.get("/api/v1", async () => ({
  name: "camiml API",
  version: "0.1.0",
  modules: ["sales", "dispatches", "projections", "integrations"],
}));

app.get("/api/v1/orders", async (_request, reply) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, buyer, product, size, TO_CHAR(dispatch_date, 'YYYY-MM-DD') AS "dispatchDate", status
       FROM dispatch_orders ORDER BY dispatch_date, id`,
    );
    return rows;
  } catch (error) {
    app.log.error(error);
    return reply.code(503).send({ message: "No se pudo consultar la base de datos." });
  }
});

app.patch<{ Params: { id: string }; Body: { status: OrderStatus } }>("/api/v1/orders/:id/status", async (request, reply) => {
  const { id } = request.params;
  const nextStatus = request.body?.status;
  const validStatuses: OrderStatus[] = ["to_prepare", "preparing", "ready"];
  if (!validStatuses.includes(nextStatus)) {
    return reply.code(400).send({ message: "Estado no válido." });
  }

  try {
    const current = await pool.query<{ status: OrderStatus }>("SELECT status FROM dispatch_orders WHERE id = $1", [id]);
    if (!current.rowCount) return reply.code(404).send({ message: "Pedido no encontrado." });
    const currentStatus = current.rows[0].status;
    const allowed = (currentStatus === "to_prepare" && nextStatus === "preparing")
      || (currentStatus === "preparing" && nextStatus === "ready");
    if (!allowed) return reply.code(409).send({ message: "El pedido no puede cambiar a ese estado." });

    const { rows } = await pool.query(
      `UPDATE dispatch_orders SET status = $2, updated_at = NOW() WHERE id = $1
       RETURNING id, buyer, product, size, TO_CHAR(dispatch_date, 'YYYY-MM-DD') AS "dispatchDate", status`,
      [id, nextStatus],
    );
    return rows[0];
  } catch (error) {
    app.log.error(error);
    return reply.code(503).send({ message: "No se pudo actualizar el pedido." });
  }
});

await initializeDatabase();

const port = Number(process.env.API_PORT ?? 3000);
await app.listen({ port, host: "0.0.0.0" });

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
