package com.pos.api.serverless.model;

import java.util.List;

public record VentaRequest(
    List<VentaItemRequest> items,
    String medioPago
) {}
