package com.pos.api.serverless.model;

public record Producto(
    String id,
    String nombre,
    String codigoBarras,
    Number precio,
    String categoria,
    String imagen,
    int stock,
    String unidad,
    Number tasaImpuesto
) {}
