package com.pos.api.serverless.model;

import java.util.List;

public record VentaResponse(
    String ventaId,
    String estado,
    long total,
    List<VentaItem> items
) {}
