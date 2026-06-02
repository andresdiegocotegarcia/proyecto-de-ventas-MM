package com.pos.api.serverless.repository;

import com.pos.api.serverless.model.Producto;
import java.util.List;
import java.util.Optional;

public interface ProductoRepository {
    List<Producto> findAll();
    Optional<Producto> findById(String id);
}
