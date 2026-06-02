# Tasks - POS Sistema de Ventas

## Fase 1: Backend

- [x] 1.1 Crear proyecto Maven con Java 17 y dependencias (AWS SDK v2, Lambda, Jackson, JUnit, Mockito)
- [x] 1.2 Crear template.yaml con API Gateway HTTP API, 2 Lambdas, 2 tablas DynamoDB
- [x] 1.3 Implementar modelo Producto (record Java)
- [x] 1.4 Implementar modelo Venta, VentaItem, VentaRequest, VentaResponse (records Java)
- [x] 1.5 Crear interfaz ProductoRepository con findAll() y findById()
- [x] 1.6 Crear interfaz VentaRepository con save()
- [x] 1.7 Implementar DynamoProductoRepository (Scan + GetItem)
- [x] 1.8 Implementar DynamoVentaRepository (PutItem con lista de mapas)
- [x] 1.9 Crear ApiResponse helper para serializar JSON con headers CORS
- [x] 1.10 Implementar GetProductosHandler (scan productos, responder 200 o 500)
- [x] 1.11 Implementar PostVentasHandler (validar, buscar productos, calcular total, guardar, responder 201)
- [x] 1.12 Configurar maven-shade-plugin para generar JAR aws

## Fase 2: Pruebas Unitarias

- [x] 2.1 GetProductosHandlerTest - caso exitoso con productos
- [x] 2.2 GetProductosHandlerTest - tabla vacia retorna arreglo vacio
- [x] 2.3 GetProductosHandlerTest - error de repositorio retorna 500
- [x] 2.4 PostVentasHandlerTest - venta exitosa retorna 201
- [x] 2.5 PostVentasHandlerTest - producto inexistente retorna 404
- [x] 2.6 PostVentasHandlerTest - error DynamoDB retorna 500
- [x] 2.7 PostVentasHandlerTest - body invalido (items vacio) retorna 400
- [x] 2.8 PostVentasHandlerTest - medioPago vacio retorna 400
- [x] 2.9 PostVentasHandlerTest - item sin productoId retorna 400
- [x] 2.10 PostVentasHandlerTest - item con cantidad 0 retorna 400

## Fase 3: Frontend React

- [x] 3.1 Crear proyecto Vite + React
- [x] 3.2 Configurar .env con VITE_API_URL
- [x] 3.3 Implementar api.js con fetchProductos() y registrarVenta() usando async/await
- [x] 3.4 Implementar ProductList.jsx (fetch productos, grid con imagen/nombre/precio, boton agregar)
- [x] 3.5 Implementar SaleForm.jsx (carrito, controles cantidad, selector medioPago, boton registrar)
- [x] 3.6 Implementar App.jsx (estado del carrito, mensajes exito/error)
- [x] 3.7 Estilos CSS dark theme responsive

## Fase 4: Despliegue

- [x] 4.1 sam validate
- [x] 4.2 sam build
- [x] 4.3 sam deploy
- [x] 4.4 Cargar productos seed en DynamoDB
- [x] 4.5 Verificar GET /productos en Postman/navegador
- [x] 4.6 Verificar POST /ventas en Postman

## Fase 5: Documentacion

- [x] 5.1 Crear requirements.md
- [x] 5.2 Crear design.md
- [x] 5.3 Crear tasks.md
- [x] 5.4 Completar README backend
- [x] 5.5 Crear README frontend
- [ ] 5.6 Agregar capturas de evidencia (manual)

## Notas
- Las pruebas usan Mockito para mockear repositorios, no conectan a AWS real
- El frontend usa variable de entorno para la URL del API, no hardcodeada
- JaCoCo genera reporte de cobertura automaticamente al correr mvn test
