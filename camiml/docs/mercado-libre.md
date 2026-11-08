# Integración con Mercado Libre

## Preparación

1. Registrar una aplicación en el portal de desarrolladores de Mercado Libre.
2. Configurar la URL de retorno indicada en `MELI_REDIRECT_URI`.
3. Guardar `MELI_CLIENT_ID` y `MELI_CLIENT_SECRET` en el entorno del servidor.
4. Autorizar la cuenta y almacenar de forma segura los tokens y su vencimiento.

## Diseño sugerido

- Rutas de inicio y callback OAuth bajo `/integrations/mercadolibre`.
- Guardar refresh token cifrado y renovar el access token antes de vencer.
- Sincronizar órdenes pagadas y consultar sus envíos para las fechas de despacho.
- Usar identificadores externos e idempotencia para evitar pedidos duplicados.
- Registrar cursores, última sincronización y errores para permitir reintentos.
- Respetar límites de uso de la API; no exponer tokens al navegador ni a logs.

Las fechas y estados disponibles dependen de los recursos y permisos concedidos a la aplicación. Confirmar esos campos con la cuenta y el país objetivo antes de implementar el calendario.
