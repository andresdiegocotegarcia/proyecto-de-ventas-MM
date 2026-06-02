# Requirements - POS Sistema de Ventas

## Descripcion General

Sistema POS (Point of Sale) para supermercado con backend serverless en AWS y frontend React. Permite consultar productos y registrar ventas.

## Requisitos Funcionales

### RF-01: Consulta de Productos
- El sistema debe exponer un endpoint `GET /productos`
- Debe consultar todos los productos almacenados en DynamoDB
- Debe responder con formato JSON
- Si la tabla esta vacia, debe retornar un arreglo vacio `{"productos": []}`
- Si ocurre un error interno, debe responder HTTP 500 con mensaje descriptivo

### RF-02: Registro de Ventas
- El sistema debe exponer un endpoint `POST /ventas`
- Debe recibir un body JSON con items y medio de pago
- Debe validar que el body sea JSON valido
- Debe validar que exista al menos un item
- Debe validar que cada item tenga `productoId` no vacio
- Debe validar que cada item tenga `cantidad` entera mayor a cero
- Debe validar que `medioPago` no este vacio
- Debe verificar que cada producto exista en DynamoDB
- Si un producto no existe, debe responder HTTP 404
- Debe calcular el total como suma de precio * cantidad por item
- Debe guardar la venta en DynamoDB con: id (UUID), fecha, estado, medioPago, items, total
- Debe responder HTTP 201 con ventaId, estado, total e items

### RF-03: Frontend - Vista de Productos
- El frontend debe consumir `GET /productos`
- Debe mostrar nombre, precio e imagen de cada producto
- Debe permitir seleccionar un producto para agregarlo al carrito
- Debe manejar estado de carga y error

### RF-04: Frontend - Flujo de Venta
- El frontend debe permitir seleccionar cantidad por producto
- Debe permitir seleccionar metodo de pago
- Debe enviar la venta via `POST /ventas`
- Debe mostrar mensaje de exito con ID de venta y total
- Debe mostrar mensaje de error si la API falla

## Modelo de Datos

### Producto (DynamoDB)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (PK) | Identificador unico |
| nombre | String | Nombre del producto |
| codigoBarras | String | Codigo de barras |
| precio | Number | Precio en centavos |
| categoria | String | Categoria del producto |
| imagen | String | URL de imagen |
| stock | Number | Unidades disponibles |
| unidad | String | Tipo de unidad (kg, unidad) |
| tasaImpuesto | Number | Tasa de impuesto (0 o 0.16) |

### Venta (DynamoDB)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (PK) | UUID de la venta |
| fecha | String | Fecha ISO-8601 UTC |
| estado | String | Siempre "REGISTRADA" |
| medioPago | String | Metodo de pago |
| items | List | Lista de items vendidos |
| total | Number | Total de la venta |

### VentaItem (dentro de items)
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| productoId | String | ID del producto |
| nombre | String | Nombre del producto |
| cantidad | Number | Cantidad vendida |
| precioUnitario | Number | Precio unitario |
| subtotal | Number | precio * cantidad |

## Respuestas Esperadas

### GET /productos - Exito
```json
{
  "productos": [
    {"id":"1","nombre":"Manzana Roja","precio":10165,...}
  ]
}
```

### POST /ventas - Exito (201)
```json
{
  "ventaId": "uuid",
  "estado": "REGISTRADA",
  "total": 20330,
  "items": [{"productoId":"1","nombre":"Manzana Roja","cantidad":2,"precioUnitario":10165,"subtotal":20330}]
}
```

### Errores
- 400: "La venta requiere al menos un item"
- 400: "El campo medioPago es obligatorio"
- 400: "Cada item requiere productoId"
- 400: "Cada item requiere cantidad entera mayor a cero"
- 404: "Producto <id> no existe"
- 500: "No fue posible consultar productos"
- 500: "No fue posible registrar la venta"

## Criterios de Aceptacion - Pruebas

### GET /productos
- AC-1: Retorna 200 con lista de productos cuando existen
- AC-2: Retorna 200 con arreglo vacio cuando la tabla esta vacia
- AC-3: Retorna 500 cuando DynamoDB falla

### POST /ventas
- AC-4: Retorna 201 y guarda la venta cuando el request es valido
- AC-5: Retorna 400 cuando items esta vacio
- AC-6: Retorna 400 cuando medioPago esta vacio
- AC-7: Retorna 400 cuando un item no tiene productoId
- AC-8: Retorna 400 cuando un item tiene cantidad <= 0
- AC-9: Retorna 404 cuando un producto no existe
- AC-10: Retorna 500 cuando falla al guardar en DynamoDB
