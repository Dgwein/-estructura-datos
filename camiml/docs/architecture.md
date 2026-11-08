# Arquitectura inicial

## Componentes

- `apps/web`: interfaz React + Vite para despacho, ventas, clientes y perfil.
- `apps/api`: API Fastify y proveedor de órdenes intercambiable.
- `packages/shared`: contratos TypeScript para ventas y proyecciones.
- `MockMercadoLibreProvider`: fuente temporal en memoria para probar pedidos y estados, sin conexión real.

## Flujo principal

1. El mock entrega órdenes ficticias en el formato común del CRM.
2. La interfaz agrupa los pedidos por fecha y estado de preparación.
3. Marcar un pedido listo simula un aviso de stock disponible.
4. Más adelante, un proveedor de Mercado Libre reemplazará al mock y mapeará ese flujo a los recursos y permisos disponibles para la cuenta.

La pantalla de perfil reserva la identidad de acceso para OAuth de Mercado Libre. El ID del vendedor es la referencia estable; el correo privado se consulta con el token autorizado y se presenta como dato de solo lectura. El perfil de demostración guarda preferencias en el navegador. Amazon y TikTok Shop aparecen como canales seleccionables, pero aún no tienen proveedor ni datos.

El análisis de clientes actual usa registros ficticios para mostrar recompra, frecuencia y segmentos. Las ideas de beneficios son orientativas y no ejecutan descuentos ni envían mensajes.

Las reglas de pronóstico deben ser configurables y explicar el período y los datos usados. La primera versión puede comenzar con promedios móviles y cantidades ya vendidas, dejando modelos más complejos para después.
