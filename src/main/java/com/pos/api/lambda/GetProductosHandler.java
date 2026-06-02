package com.pos.api.lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.pos.api.serverless.model.Producto;
import com.pos.api.serverless.repository.DynamoProductoRepository;
import com.pos.api.serverless.repository.ProductoRepository;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.util.List;
import java.util.Map;

public class GetProductosHandler implements RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

    private final ProductoRepository productoRepository;

    public GetProductosHandler() {
        DynamoDbClient client = DynamoDbClient.create();
        String tableName = System.getenv("PRODUCTOS_TABLE");
        this.productoRepository = new DynamoProductoRepository(client, tableName);
    }

    // Constructor para testing
    public GetProductosHandler(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Override
    public APIGatewayV2HTTPResponse handleRequest(APIGatewayV2HTTPEvent event, Context context) {
        try {
            List<Producto> productos = productoRepository.findAll();
            return ApiResponse.json(200, Map.of("productos", productos));
        } catch (Exception e) {
            if (context != null) {
                context.getLogger().log("Error consultando productos: " + e.getMessage());
            }
            return ApiResponse.json(500, Map.of("message", "No fue posible consultar productos"));
        }
    }
}
