# Arquitectura inicial

## Componentes

- `apps/web`: interfaz React + Vite para la operación diaria.
- `apps/api`: API Fastify y proveedor de órdenes intercambiable.
- `packages/shared`: contratos TypeScript para ventas y proyecciones.
- `MockMercadoLibreProvider`: fuente temporal en memoria para probar pedidos y estados, sin conexión real.

## Flujo principal

1. El mock entrega órdenes ficticias en el formato común del CRM.
2. La interfaz agrupa los pedidos por fecha y estado de preparación.
3. Marcar un pedido listo simula un aviso de stock disponible.
4. Más adelante, un proveedor de Mercado Libre reemplazará al mock y mapeará ese flujo a los recursos y permisos disponibles para la cuenta.

Las reglas de pronóstico deben ser configurables y explicar el período y los datos usados. La primera versión puede comenzar con promedios móviles y cantidades ya vendidas, dejando modelos más complejos para después.
