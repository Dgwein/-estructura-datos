import Fastify from "fastify";
import cors from "@fastify/cors";
import { orderProvider, OrderStatus } from "./order-provider.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
});

app.get("/health", async () => ({ status: "ok", service: "camiml-api" }));

app.get("/api/v1", async () => ({
  name: "camiml API",
  version: "0.1.0",
  modules: ["sales", "dispatches", "projections", "integrations"],
  dataSource: "mock-mercadolibre",
}));

app.get("/api/v1/orders", async () => orderProvider.listOrders());

app.patch<{ Params: { id: string }; Body: { status: OrderStatus } }>("/api/v1/orders/:id/status", async (request, reply) => {
  const { id } = request.params;
  const nextStatus = request.body?.status;
  const validStatuses: OrderStatus[] = ["to_prepare", "preparing", "ready"];
  if (!validStatuses.includes(nextStatus)) {
    return reply.code(400).send({ message: "Estado no válido." });
  }

  const updated = await orderProvider.updateOrderStatus(id, nextStatus);
  if (!updated) return reply.code(404).send({ message: "Pedido no encontrado." });
  if (updated === "invalid-transition") return reply.code(409).send({ message: "El pedido no puede cambiar a ese estado." });
  return updated;
});

const port = Number(process.env.API_PORT ?? 3000);
await app.listen({ port, host: "0.0.0.0" });

const shutdown = async () => {
  await app.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
