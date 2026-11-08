import Fastify from "fastify";
import cors from "@fastify/cors";

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

const port = Number(process.env.API_PORT ?? 3000);
await app.listen({ port, host: "0.0.0.0" });
