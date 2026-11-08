# Modelo de dominio inicial

- **Sale**: pedido externo, fecha de compra, estado local y productos vendidos.
- **SaleItem**: publicación, título, cantidad, tipo de traje y talla normalizados.
- **Shipment**: envío asociado, fecha límite y estado logístico.
- **ProductVariant**: catálogo normalizado que vincula publicaciones con tipo y talla.
- **PreparationProjection**: unidades estimadas agrupadas por período, tipo y talla.
- **IntegrationConnection**: cuenta autorizada, tokens cifrados y estado de sincronización.

El mapeo de tallas y tipos debe ser editable: el título de una publicación no siempre usa una nomenclatura uniforme.
