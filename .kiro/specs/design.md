# Design - POS Sistema de Ventas

## Decisiones de Arquitectura

### Backend Serverless
- **Runtime**: Java 17 — lenguaje requerido por la materia, robusto y tipado
- **Framework de IaC**: AWS SAM — simplifica la definicion de Lambdas y API Gateway
- **API**: API Gateway HTTP API — mas liviano y economico que REST API
- **Compute**: AWS Lambda — escalado automatico, pago por uso
- **Base de datos**: DynamoDB — NoSQL sin servidor, esquema flexible, PAY_PER_REQUEST
- **Build**: Maven con shade-plugin — genera JAR con todas las dependencias para Lambda

### Frontend Web
- **Framework**: React 18 con Vite — renderizado rapido, hooks modernos, ecosistema amplio
- **Justificacion**: React es el framework mas usado en la industria, los hooks permiten un codigo limpio sin clases, y Vite provee un servidor de desarrollo rapido
- **Estilos**: CSS propio — sin dependencias externas innecesarias
- **Comunicacion**: fetch API nativo con async/await

## Estructura del Backend

```
pos-api/
├── pom.xml                         (Maven, Java 17, AWS SDK v2)
├── template.yaml                   (SAM: API Gateway + 2 Lambdas + 2 tablas)
├── src/main/java/com/pos/api/
│   ├── lambda/
│   │   ├── ApiResponse.java        (Helper: serializa respuesta + CORS)
│   │   ├── GetProductosHandler.java (Lambda: GET /productos)
│   │   └── PostVentasHandler.java  (Lambda: POST /ventas)
│   └── serverless/
│       ├── model/                  (Records: Producto, Venta, VentaItem, etc.)
│       └── repository/             (Interfaces + DynamoDB implementations)
└── src/test/java/                  (JUnit 5 + Mockito)
```

## Estructura del Frontend

```
frontend/
├── package.json            (React 18, Vite)
├── vite.config.js
├── .env                    (VITE_API_URL)
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx             (Estado global del carrito)
    ├── App.css             (Estilos dark theme)
    ├── api.js              (Funciones API con async/await)
    └── components/
        ├── ProductList.jsx (Grid de productos)
        └── SaleForm.jsx    (Carrito + formulario de venta)
```

## Contrato del API

### GET /productos
- Request: sin body, sin params, sin auth
- Response 200: `{"productos": [Producto]}`
- Response 500: `{"message": "..."}`
- Headers: Content-Type: application/json, Access-Control-Allow-Origin: *

### POST /ventas
- Request body: `{"items": [{"productoId": "1", "cantidad": 2}], "medioPago": "efectivo"}`
- Response 201: `{"ventaId": "uuid", "estado": "REGISTRADA", "total": N, "items": [VentaItem]}`
- Response 400: `{"message": "..."}`
- Response 404: `{"message": "Producto <id> no existe"}`
- Response 500: `{"message": "..."}`

## Modelo de Datos DynamoDB

### ProductosTable
- Llave primaria: `id` (String)
- Billing: PAY_PER_REQUEST
- Atributos: id, nombre, codigoBarras, precio, categoria, imagen, stock, unidad, tasaImpuesto

### VentasTable
- Llave primaria: `id` (String)
- Billing: PAY_PER_REQUEST
- Atributos: id, fecha, estado, medioPago, items (lista de mapas), total

## Patron de Diseno Lambda

Cada Lambda sigue:
1. Handler recibe evento de API Gateway v2
2. Parsea y valida el request
3. Interactua con DynamoDB via Repository (interfaz)
4. Formatea respuesta JSON con ApiResponse helper

Los repositorios se inyectan por constructor para facilitar testing con mocks.

## CORS
- Configurado en API Gateway HTTP API
- Permite origen `*`, metodos GET/POST/OPTIONS, header Content-Type
- Headers de respuesta en cada Lambda incluyen Access-Control-Allow-Origin

## Permisos IAM
- GetProductosFunction: DynamoDBReadPolicy sobre ProductosTable
- PostVentasFunction: DynamoDBReadPolicy sobre ProductosTable + DynamoDBCrudPolicy sobre VentasTable
