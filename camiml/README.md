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
- Docker Desktop (opcional, para PostgreSQL local)

## Inicio

```bash
npm install
npm run dev
```

La interfaz estará disponible en `http://localhost:5173` y la API en `http://localhost:3000`.

Para levantar PostgreSQL local:

```bash
docker compose up -d db
```

Duplica `.env.example` como `.env` y completa las variables necesarias antes de conectar servicios externos. No guardes tokens ni credenciales en Git.

## Estado actual

Este repositorio contiene la estructura inicial y contratos de dominio. La autenticación OAuth de Mercado Libre, sincronización, persistencia y vistas funcionales se implementarán en las siguientes etapas.

## Documentación

- [Arquitectura inicial](docs/architecture.md)
- [Integración con Mercado Libre](docs/mercado-libre.md)
- [Modelo de dominio](docs/domain-model.md)
