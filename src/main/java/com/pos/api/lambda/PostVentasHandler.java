package com.pos.api.lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pos.api.serverless.model.*;
import com.pos.api.serverless.repository.DynamoProductoRepository;
import com.pos.api.serverless.repository.DynamoVentaRepository;
import com.pos.api.serverless.repository.ProductoRepository;
import com.pos.api.serverless.repository.VentaRepository;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.time.Instant;
import java.util.*;

public class PostVentasHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final ProductoRepository productoRepository;
    private final VentaRepository ventaRepository;

    public PostVentasHandler() {
        DynamoDbClient client = DynamoDbClient.create();
        String productosTable = System.getenv("PRODUCTOS_TABLE");
        String ventasTable = System.getenv("VENTAS_TABLE");
        this.productoRepository = new DynamoProductoRepository(client, productosTable);
        this.ventaRepository = new DynamoVentaRepository(client, ventasTable);
    }

    // Constructor para testing
    public PostVentasHandler(ProductoRepository productoRepository, VentaRepository ventaRepository) {
        this.productoRepository = productoRepository;
        this.ventaRepository = ventaRepository;
    }

    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent event, Context context) {
        try {
            // Parsear body
            String body = event.getBody();
            VentaRequest request;
            try {
                request = MAPPER.readValue(body, VentaRequest.class);
            } catch (Exception e) {
                return ApiResponse.json(400, Map.of("message", "El body debe ser JSON valido"));
            }

            // Validar items
            if (request.items() == null || request.items().isEmpty()) {
                return ApiResponse.json(400, Map.of("message", "La venta requiere al menos un item"));
            }

            // Validar medioPago
            if (request.medioPago() == null || request.medioPago().isBlank()) {
                return ApiResponse.json(400, Map.of("message", "El campo medioPago es obligatorio"));
            }

            // Procesar items
            List<VentaItem> ventaItems = new ArrayList<>();
            long total = 0;

            for (VentaItemRequest itemReq : request.items()) {
                // Validar productoId
                if (itemReq.productoId() == null || itemReq.productoId().isBlank()) {
                    return ApiResponse.json(400, Map.of("message", "Cada item requiere productoId"));
                }

                // Validar cantidad
                if (itemReq.cantidad() == null || itemReq.cantidad() <= 0) {
                    return ApiResponse.json(400, Map.of("message", "Cada item requiere cantidad entera mayor a cero"));
                }

                // Buscar producto
                Optional<Producto> optProducto = productoRepository.findById(itemReq.productoId());
                if (optProducto.isEmpty()) {
                    return ApiResponse.json(404, Map.of("message", "Producto " + itemReq.productoId() + " no existe"));
                }

                Producto producto = optProducto.get();
                long precioUnitario = producto.precio().longValue();
                long subtotal = precioUnitario * itemReq.cantidad();
                total += subtotal;

                ventaItems.add(new VentaItem(
                        producto.id(),
                        producto.nombre(),
                        itemReq.cantidad(),
                        precioUnitario,
                        subtotal
                ));
            }

            // Crear venta
            Venta venta = new Venta(
                    UUID.randomUUID().toString(),
                    Instant.now().toString(),
                    "REGISTRADA",
                    request.medioPago().trim(),
                    ventaItems,
                    total
            );

            // Guardar
            ventaRepository.save(venta);

            // Responder
            VentaResponse response = new VentaResponse(
                    venta.id(),
                    venta.estado(),
                    venta.total(),
                    venta.items()
            );

            return ApiResponse.json(201, response);

        } catch (Exception e) {
            if (context != null) {
                context.getLogger().log("Error registrando venta: " + e.getMessage());
            }
            return ApiResponse.json(500, Map.of("message", "No fue posible registrar la venta"));
        }
    }
}
