# Arquitectura inicial

## Componentes

- `apps/web`: interfaz React + Vite para la operación diaria.
- `apps/api`: API Fastify, OAuth, sincronización y reglas del negocio.
- `packages/shared`: contratos TypeScript para ventas y proyecciones.
- PostgreSQL: persistencia de pedidos, catálogo, conexión y eventos de sincronización.

## Flujo principal

1. La persona responsable conecta una cuenta de Mercado Libre mediante OAuth.
2. La API obtiene pedidos y sus envíos, con sincronización periódica e incremental.
3. Los pedidos se normalizan al modelo interno, conservando los identificadores externos.
4. El CRM calcula tareas y fechas de preparación a partir de la venta y los datos del envío.
5. Las proyecciones agregan ventas históricas y pedidos futuros por producto, talla y tipo.

Las reglas de pronóstico deben ser configurables y explicar el período y los datos usados. La primera versión puede comenzar con promedios móviles y cantidades ya vendidas, dejando modelos más complejos para después.
