package com.pos.api.serverless.repository;

import com.pos.api.serverless.model.Producto;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.*;
import java.util.stream.Collectors;

public class DynamoProductoRepository implements ProductoRepository {

    private final DynamoDbClient client;
    private final String tableName;

    public DynamoProductoRepository(DynamoDbClient client, String tableName) {
        this.client = client;
        this.tableName = tableName;
    }

    @Override
    public List<Producto> findAll() {
        ScanResponse response = client.scan(ScanRequest.builder()
                .tableName(tableName)
                .build());
        return response.items().stream()
                .map(this::toProducto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Producto> findById(String id) {
        GetItemResponse response = client.getItem(GetItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("id", AttributeValue.builder().s(id).build()))
                .build());
        if (!response.hasItem() || response.item().isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(toProducto(response.item()));
    }

    private Producto toProducto(Map<String, AttributeValue> item) {
        return new Producto(
                getS(item, "id"),
                getS(item, "nombre"),
                getS(item, "codigoBarras"),
                getN(item, "precio"),
                getS(item, "categoria"),
                getS(item, "imagen"),
                getInt(item, "stock"),
                getS(item, "unidad"),
                getDouble(item, "tasaImpuesto")
        );
    }

    private String getS(Map<String, AttributeValue> item, String key) {
        AttributeValue v = item.get(key);
        return v != null && v.s() != null ? v.s() : "";
    }

    private long getN(Map<String, AttributeValue> item, String key) {
        AttributeValue v = item.get(key);
        return v != null && v.n() != null ? Long.parseLong(v.n()) : 0;
    }

    private int getInt(Map<String, AttributeValue> item, String key) {
        AttributeValue v = item.get(key);
        return v != null && v.n() != null ? Integer.parseInt(v.n()) : 0;
    }

    private double getDouble(Map<String, AttributeValue> item, String key) {
        AttributeValue v = item.get(key);
        return v != null && v.n() != null ? Double.parseDouble(v.n()) : 0.0;
    }
}
