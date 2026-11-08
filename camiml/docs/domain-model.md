# Modelo de dominio inicial

- **Sale**: pedido externo, fecha de compra, estado local y productos vendidos.
- **SaleItem**: publicación, título, cantidad, tipo de traje y talla normalizados.
- **Shipment**: envío asociado, fecha de despacho prevista y estado de preparación (`to_prepare`, `preparing`, `ready`).
- **DispatchOrder**: pedido de despacho en el contrato común que entrega el proveedor real o el mock.
- **ProductVariant**: catálogo normalizado que vincula publicaciones con tipo y talla.
- **PreparationProjection**: unidades estimadas agrupadas por período, tipo y talla.
- **IntegrationConnection**: cuenta autorizada, tokens cifrados y estado de sincronización.

El mapeo de tallas y tipos debe ser editable: el título de una publicación no siempre usa una nomenclatura uniforme.

Las tallas habilitadas actualmente son `0-3 Meses`, `3-6 Meses`, `6-9 Meses`, `9-12 Meses`, `12-18 Meses`, `2A`, `3A`, `4A` y `5A`.

Los estados de preparación (`to_prepare`, `preparing`, `ready`) son parte del flujo del CRM. Su relación con cambios de stock en Mercado Libre se implementará en el proveedor real; el mock únicamente los simula en memoria.
