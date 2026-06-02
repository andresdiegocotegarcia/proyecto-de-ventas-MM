package com.pos.api.lambda;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.pos.api.serverless.model.Producto;
import com.pos.api.serverless.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetProductosHandlerTest {

    @Mock
    private ProductoRepository productoRepository;

    private GetProductosHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GetProductosHandler(productoRepository);
    }

    @Test
    void retorna200ConProductos() {
        List<Producto> productos = List.of(
                new Producto("1", "Manzana Roja", "7501234567890", 10165, "frutas-verduras",
                        "https://example.com/img.jpg", 150, "kg", 0)
        );
        when(productoRepository.findAll()).thenReturn(productos);

        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(200, response.getStatusCode());
        assertTrue(response.getBody().contains("Manzana Roja"));
        assertTrue(response.getBody().contains("\"productos\""));
    }

    @Test
    void retorna200ConArregloVacio() {
        when(productoRepository.findAll()).thenReturn(List.of());

        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(200, response.getStatusCode());
        assertTrue(response.getBody().contains("\"productos\":[]"));
    }

    @Test
    void retorna500CuandoFallaRepositorio() {
        when(productoRepository.findAll()).thenThrow(new RuntimeException("DynamoDB error"));

        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(500, response.getStatusCode());
        assertTrue(response.getBody().contains("No fue posible consultar productos"));
    }
}
