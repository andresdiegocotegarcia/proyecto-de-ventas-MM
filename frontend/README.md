# POS Frontend — Punto de Venta

## Descripcion de Arquitectura

Frontend web que implementa una interfaz de punto de venta (POS) para supermercado. Se comunica con el backend serverless desplegado en AWS via API Gateway.

Arquitectura cliente-servidor:
- **Cliente**: React SPA ejecutandose en el navegador
- **Servidor**: API Gateway + Lambda + DynamoDB (backend serverless)

## Framework y Justificacion Tecnica

**React 18 con Vite**

Justificacion:
- React es el framework frontend mas usado en la industria
- Los hooks (`useState`, `useEffect`) permiten un codigo funcional limpio sin clases
- Vite provee un servidor de desarrollo rapido con HMR (Hot Module Replacement)
- Ecosistema amplio con documentacion extensa
- Ideal para SPAs con manejo de estado como un carrito de compras

## Instrucciones para Correr Localmente

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar URL del API

Editar el archivo `.env`:

```env
VITE_API_URL=https://feynm45f53.execute-api.us-east-1.amazonaws.com/prod
```

Para desarrollo local con SAM:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000` en el navegador.

### 4. Build de produccion

```bash
npm run build
```

Los archivos estaticos se generan en `dist/`.

## Configuracion del API Gateway

La URL del API se configura en el archivo `.env` usando la variable `VITE_API_URL`. Esto evita hardcodear URLs en el codigo fuente.

El archivo `.env.example` contiene un template:
```env
VITE_API_URL=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod
```

En el codigo, se accede via:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

## Funcionalidades

### Vista de Productos
- Muestra grid de productos con imagen, nombre y precio
- Precio se muestra en formato pesos (precio/100)
- Muestra stock disponible
- Boton "Agregar" para anadir al carrito
- Estado de carga mientras se consultan productos
- Mensaje de error si la API no responde

### Carrito de Compras
- Items seleccionados con controles de cantidad (+/-)
- Subtotal por item
- Total general
- Boton para eliminar items
- Selector de metodo de pago (efectivo, tarjeta, transferencia)

### Registro de Venta
- Envia POST /ventas con items y medioPago
- Muestra mensaje de exito con ID de venta y total
- Muestra mensaje de error descriptivo si falla
- Deshabilita boton durante el envio para evitar duplicados

## Buenas Practicas Implementadas

- URL del API en variable de entorno (no hardcodeada)
- HTML semantico con roles ARIA para accesibilidad
- CSS propio sin frameworks externos
- Asincronismo con async/await
- Manejo de errores con try/catch
- Hooks de React (useState, useEffect) — sin class components
- Componentes modulares y reutilizables

## Proceso SDD

El frontend se desarrollo siguiendo los specs definidos en `.kiro/specs/`:
- Los requisitos RF-03 y RF-04 definen el comportamiento esperado del frontend
- El diseno documenta la estructura de archivos y la comunicacion con el API
- Las tareas de la Fase 3 guiaron la implementacion secuencial

## Evidencias

### Listado de productos cargado desde el API
![Productos](../docs/evidencias/frontend-productos.png)

### Venta exitosa
![Venta exitosa](../docs/evidencias/frontend-venta-exitosa.png)

### Manejo de error
![Error](../docs/evidencias/frontend-error.png)

> **Nota**: Si las imagenes no cargan, insertar capturas en `docs/evidencias/`

## Estructura

```
frontend/
├── .env                (URL del API)
├── .env.example        (template)
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx        (entrada React)
    ├── App.jsx         (estado global, mensajes)
    ├── App.css         (estilos)
    ├── api.js          (fetchProductos, registrarVenta)
    └── components/
        ├── ProductList.jsx
        └── SaleForm.jsx
```
