# camiml

CRM para centralizar ventas de Mercado Libre, organizar despachos futuros y planificar la preparación de productos por talla y tipo de traje.

## Objetivos iniciales

- Sincronizar ventas y publicaciones de Mercado Libre.
- Convertir ventas confirmadas en tareas de preparación y despacho.
- Mostrar un calendario de despachos con fechas y estado.
- Proyectar necesidades por tipo de traje, talla y período usando ventas históricas y pedidos próximos.

## Estructura

```text
camiml/
├── apps/
│   ├── api/                 # API HTTP y lógica de negocio
│   └── web/                 # Aplicación web del CRM
├── packages/
│   └── shared/              # Tipos y contratos compartidos
├── infra/                   # Recursos locales de infraestructura
├── docs/                    # Arquitectura y guía de integración
├── .env.example
├── compose.yaml
└── package.json
```

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Inicio

```bash
npm install
npm run dev
```

La interfaz estará disponible en `http://localhost:5173` y la API en `http://localhost:3000`.

## Mock funcional

La pantalla inicial muestra dos módulos navegables con datos ficticios:

- **Calendario de despacho**: cambia de mes, selecciona días, usa las tarjetas para filtrar pedidos y abre cada pedido para revisar su detalle.
- **Preparación**: avanza cada pedido de «por preparar» a «preparando» y simula el aviso de stock disponible al marcarlo listo.
- **Historial de ventas**: revisa 12 meses de unidades, venta total, tendencia mensual y distribución por tipo de traje y talla.

Las tallas de la maqueta son `0-3 Meses`, `3-6 Meses`, `6-9 Meses`, `9-12 Meses`, `12-18 Meses`, `2A`, `3A`, `4A` y `5A`.

El período de análisis de la demo es noviembre de 2025 a octubre de 2026. Estos números sirven para visualizar la experiencia; se reemplazarán por datos reales al implementar la integración con Mercado Libre.

## Estado actual

Por ahora la API usa `MockMercadoLibreProvider`, un conjunto de pedidos ficticios mantenido en memoria. Las acciones de cambio de estado y aviso de stock son simulaciones: no se consulta ni modifica Mercado Libre, y los cambios se reinician si se reinicia la API. La conexión en línea sustituirá este proveedor cuando se implemente.

## Documentación

- [Arquitectura inicial](docs/architecture.md)
- [Integración con Mercado Libre](docs/mercado-libre.md)
- [Modelo de dominio](docs/domain-model.md)
