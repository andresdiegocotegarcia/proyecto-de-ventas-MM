package com.pos.api.serverless.model;

public record VentaItem(
    String productoId,
    String nombre,
    int cantidad,
    long precioUnitario,
    long subtotal
) {}
