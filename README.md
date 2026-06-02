# POS API — Backend Serverless para Supermercado

Backend POS (Point of Sale) construido con Java 17, AWS SAM, API Gateway HTTP API, Lambda y DynamoDB.

## Stack Tecnologico

- Java 17
- Maven
- AWS SAM
- API Gateway HTTP API
- AWS Lambda (Java 17)
- DynamoDB
- AWS SDK v2
- JUnit 5 + Mockito
- JaCoCo (cobertura)

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /productos | Lista todos los productos |
| POST | /ventas | Registra una nueva venta |

## Estructura del Proyecto

```
pos-api/
├── pom.xml
├── template.yaml
├── src/main/java/com/pos/api/
│   ├── lambda/
│   │   ├── ApiResponse.java
│   │   ├── GetProductosHandler.java
│   │   └── PostVentasHandler.java
│   └── serverless/
│       ├── model/
│       │   ├── Producto.java
│       │   ├── Venta.java
│       │   ├── VentaItem.java
│       │   ├── VentaItemRequest.java
│       │   ├── VentaRequest.java
│       │   └── VentaResponse.java
│       └── repository/
│           ├── ProductoRepository.java
│           ├── VentaRepository.java
│           ├── DynamoProductoRepository.java
│           └── DynamoVentaRepository.java
├── src/test/java/com/pos/api/lambda/
│   ├── GetProductosHandlerTest.java
│   └── PostVentasHandlerTest.java
├── events/
│   ├── get-productos.json
│   ├── post-ventas.json
│   └── post-ventas-invalid.json
├── docs/dynamodb/productos-seed.json
└── scripts/seed-productos.sh
```

## Comandos

### Ejecutar pruebas

```bash
mvn test
```

### Construir

```bash
mvn package
```

### Validar template SAM

```bash
sam validate
```

### Construir con SAM

```bash
sam build
```

### Desplegar (primera vez)

```bash
sam deploy --guided
```

### Desplegar (siguientes veces)

```bash
sam deploy
```

### Cargar productos de ejemplo

```bash
scripts/seed-productos.sh <PRODUCTOS_TABLE_NAME>
```

## Probar en Postman

### GET /productos

```
GET https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/productos
```

### POST /ventas

```
POST https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/ventas
Content-Type: application/json

{
  "items": [
    { "productoId": "1", "cantidad": 2 },
    { "productoId": "3", "cantidad": 1 }
  ],
  "medioPago": "efectivo"
}
```

## Modelo de Datos (DynamoDB - NoSQL)

### ProductosTable

```json
{
  "id": "1",
  "nombre": "Manzana Roja",
  "codigoBarras": "7501234567890",
  "precio": 10165,
  "categoria": "frutas-verduras",
  "imagen": "https://...",
  "stock": 150,
  "unidad": "kg",
  "tasaImpuesto": 0
}
```

### VentasTable

```json
{
  "id": "uuid",
  "fecha": "2026-06-01T23:00:00Z",
  "estado": "REGISTRADA",
  "medioPago": "efectivo",
  "items": [
    {
      "productoId": "1",
      "nombre": "Manzana Roja",
      "cantidad": 2,
      "precioUnitario": 10165,
      "subtotal": 20330
    }
  ],
  "total": 20330
}
```
