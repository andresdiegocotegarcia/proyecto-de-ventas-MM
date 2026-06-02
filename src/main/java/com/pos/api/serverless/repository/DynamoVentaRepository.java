package com.pos.api.serverless.repository;

import com.pos.api.serverless.model.Venta;
import com.pos.api.serverless.model.VentaItem;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.*;
import java.util.stream.Collectors;

public class DynamoVentaRepository implements VentaRepository {

    private final DynamoDbClient client;
    private final String tableName;

    public DynamoVentaRepository(DynamoDbClient client, String tableName) {
        this.client = client;
        this.tableName = tableName;
    }

    @Override
    public void save(Venta venta) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("id", AttributeValue.builder().s(venta.id()).build());
        item.put("fecha", AttributeValue.builder().s(venta.fecha()).build());
        item.put("estado", AttributeValue.builder().s(venta.estado()).build());
        item.put("medioPago", AttributeValue.builder().s(venta.medioPago()).build());
        item.put("total", AttributeValue.builder().n(String.valueOf(venta.total())).build());

        List<AttributeValue> itemsList = venta.items().stream()
                .map(this::ventaItemToMap)
                .collect(Collectors.toList());
        item.put("items", AttributeValue.builder().l(itemsList).build());

        client.putItem(PutItemRequest.builder()
                .tableName(tableName)
                .item(item)
                .build());
    }

    private AttributeValue ventaItemToMap(VentaItem vi) {
        Map<String, AttributeValue> map = new HashMap<>();
        map.put("productoId", AttributeValue.builder().s(vi.productoId()).build());
        map.put("nombre", AttributeValue.builder().s(vi.nombre()).build());
        map.put("cantidad", AttributeValue.builder().n(String.valueOf(vi.cantidad())).build());
        map.put("precioUnitario", AttributeValue.builder().n(String.valueOf(vi.precioUnitario())).build());
        map.put("subtotal", AttributeValue.builder().n(String.valueOf(vi.subtotal())).build());
        return AttributeValue.builder().m(map).build();
    }
}
