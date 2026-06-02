package com.pos.api.lambda;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.pos.api.serverless.model.Producto;
import com.pos.api.serverless.model.Venta;
import com.pos.api.serverless.repository.ProductoRepository;
import com.pos.api.serverless.repository.VentaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostVentasHandlerTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private VentaRepository ventaRepository;

    private PostVentasHandler handler;

    @BeforeEach
    void setUp() {
        handler = new PostVentasHandler(productoRepository, ventaRepository);
    }

    @Test
    void registraVentaExitosa201() {
        Producto producto = new Producto("1", "Manzana Roja", "7501234567890", 10165,
                "frutas-verduras", "https://example.com/img.jpg", 150, "kg", 0);
        when(productoRepository.findById("1")).thenReturn(Optional.of(producto));

        String body = "{\"items\":[{\"productoId\":\"1\",\"cantidad\":2}],\"medioPago\":\"efectivo\"}";
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setBody(body);

        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(201, response.getStatusCode());
        assertTrue(response.getBody().contains("REGISTRADA"));
        assertTrue(response.getBody().contains("20330"));
        verify(ventaRepository, times(1)).save(any(Venta.class));
    }

    @Test
    void retorna404CuandoProductoNoExiste() {
        when(productoRepository.findById("999")).thenReturn(Optional.empty());

        String body = "{\"items\":[{\"productoId\":\"999\",\"cantidad\":1}],\"medioPago\":\"efectivo\"}";
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setBody(body);

        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(404, response.getStatusCode());
        assertTrue(response.getBody().contains("Producto 999 no existe"));
    }

    @Test
    void retorna500CuandoFallaDynamoDB() {
        Producto producto = new Producto("1", "Manzana Roja", "7501234567890", 10165,
                "frutas-verduras", "https://example.com/img.jpg", 150, "kg", 0);
        when(productoRepository.findById("1")).thenReturn(Optional.of(producto));
        doThrow(new RuntimeException("DynamoDB error")).when(ventaRepository).save(any(Venta.class));

        String body = "{\"items\":[{\"productoId\":\"1\",\"cantidad\":1}],\"medioPago\":\"tarjeta\"}";
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setBody(body);

        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(500, response.getStatusCode());
        assertTrue(response.getBody().contains("No fue posible registrar la venta"));
    }

    @Test
    void retorna400ConBodyInvalido() {
        String body = "{\"items\":[],\"medioPago\":\"efectivo\"}";
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setBody(body);

        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("La venta requiere al menos un item"));
    }

    @Test
    void retorna400SinMedioPago() {
        String body = "{\"items\":[{\"productoId\":\"1\",\"cantidad\":1}],\"medioPago\":\"\"}";
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setBody(body);

        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("medioPago es obligatorio"));
    }

    @Test
    void retorna400SinProductoId() {
        String body = "{\"items\":[{\"productoId\":\"\",\"cantidad\":1}],\"medioPago\":\"efectivo\"}";
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setBody(body);

        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("productoId"));
    }

    @Test
    void retorna400ConCantidadCero() {
        String body = "{\"items\":[{\"productoId\":\"1\",\"cantidad\":0}],\"medioPago\":\"efectivo\"}";
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        event.setBody(body);

        APIGatewayV2HTTPResponse response = handler.handleRequest(event, null);

        assertEquals(400, response.getStatusCode());
        assertTrue(response.getBody().contains("cantidad entera mayor a cero"));
    }
}
