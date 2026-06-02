package com.pos.api.serverless.model;

import java.util.List;

public record Venta(
    String id,
    String fecha,
    String estado,
    String medioPago,
    List<VentaItem> items,
    long total
) {}
