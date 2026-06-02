# POS API — Backend Serverless para Supermercado

## Descripcion de Arquitectura

Backend serverless construido con Java 17 y AWS SAM. La arquitectura utiliza servicios completamente administrados de AWS:

- **API Gateway HTTP API**: punto de entrada HTTP publico con CORS habilitado
- **AWS Lambda (Java 17)**: funciones serverless que procesan las peticiones
- **DynamoDB**: base de datos NoSQL con esquema flexible y billing PAY_PER_REQUEST

Patron de diseno en cada Lambda: **Handler → Validacion → Repository → Respuesta**

Los repositorios se definen como interfaces para facilitar la inyeccion de mocks en pruebas unitarias.

## Stack Tecnologico

- Java 17
- Maven 3.9+
- AWS SAM CLI
- AWS SDK v2 para DynamoDB
- Jackson para JSON
- JUnit 5 + Mockito para pruebas
- JaCoCo para cobertura

## Endpoints

| Metodo | Ruta | Lambda | Descripcion |
|--------|------|--------|-------------|
| GET | /productos | GetProductosFunction | Consulta todos los productos |
| POST | /ventas | PostVentasFunction | Registra una venta |

## URL Base del API Gateway

```
https://feynm45f53.execute-api.us-east-1.amazonaws.com/prod
```

## Tablas DynamoDB

### ProductosTable
- Llave primaria: `id` (String)
- Billing: PAY_PER_REQUEST
- Contiene: id, nombre, codigoBarras, precio, categoria, imagen, stock, unidad, tasaImpuesto

### VentasTable
- Llave primaria: `id` (String)
- Billing: PAY_PER_REQUEST
- Contiene: id, fecha, estado, medioPago, items (lista), total

## Pasos de Despliegue

### 1. Validar template

```bash
sam validate
```

### 2. Construir

```bash
sam build
```

### 3. Desplegar (primera vez)

```bash
sam deploy --guided
```

### 4. Desplegar (siguientes veces)

```bash
sam deploy
```

### 5. Cargar productos de ejemplo

```bash
scripts/seed-productos.sh <PRODUCTOS_TABLE_NAME>
```

## Pruebas Unitarias

### Ejecutar pruebas

```bash
mvn test
```

### Resultado esperado

```
Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

### Cobertura (JaCoCo)

El reporte se genera automaticamente en:
```
target/site/jacoco/index.html
```

### Casos de prueba cubiertos

**GetProductosHandlerTest:**
- Retorna 200 con productos existentes
- Retorna 200 con arreglo vacio si tabla vacia
- Retorna 500 cuando falla el repositorio

**PostVentasHandlerTest:**
- Registra venta exitosa (201)
- Producto inexistente (404)
- Error al guardar en DynamoDB (500)
- Body invalido - items vacio (400)
- MedioPago vacio (400)
- Item sin productoId (400)
- Item con cantidad cero (400)

## Proceso SDD (Spec-Driven Development)

El desarrollo siguio un enfoque SDD:

1. **Requirements** (`.kiro/specs/requirements.md`): se definieron requisitos funcionales, modelo de datos, respuestas esperadas y criterios de aceptacion
2. **Design** (`.kiro/specs/design.md`): se documentaron decisiones de arquitectura, estructura del proyecto, contrato del API y modelo DynamoDB
3. **Tasks** (`.kiro/specs/tasks.md`): se desgloso la implementacion en tareas incrementales por fases (backend, pruebas, frontend, despliegue, documentacion)

Los specs se crearon antes de la implementacion y se usaron como guia durante el desarrollo.

## Evidencias

### GET /productos exitoso (Postman)
![GET productos](docs/evidencias/get-productos-exitoso.png)

### POST /ventas exitoso (Postman)
![POST ventas](docs/evidencias/post-ventas-exitoso.png)

### Caso de error (Postman)
![Error 404](docs/evidencias/error-producto-no-existe.png)

### Pruebas unitarias ejecutandose
![Tests](docs/evidencias/mvn-test-exitoso.png)

> **Nota**: Si las imagenes no cargan, insertar capturas en la carpeta `docs/evidencias/`

## Estructura del Proyecto

```
pos-api/
├── pom.xml
├── template.yaml
├── README.md
├── .kiro/specs/
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
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
├── docs/dynamodb/productos-seed.json
├── scripts/seed-productos.sh
└── frontend/ (ver README del frontend)
```

## Eliminar recursos de AWS

Para evitar costos despues de la evaluacion:

```bash
sam delete --stack-name pos-api
```
