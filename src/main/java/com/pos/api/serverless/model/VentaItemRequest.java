package com.pos.api.serverless.model;

public record VentaItemRequest(
    String productoId,
    Integer cantidad
) {}
