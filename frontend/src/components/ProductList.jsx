import { useState, useEffect } from 'react';
import { fetchProductos } from '../api';

function ProductList({ onAddToCart }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductos();
        setProductos(data);
      } catch (err) {
        setError(err.message || 'Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    loadProductos();
  }, []);

  if (loading) {
    return <div className="loading" aria-live="polite">Cargando productos...</div>;
  }

  if (error) {
    return <div className="error" role="alert">{error}</div>;
  }

  if (productos.length === 0) {
    return <p>No hay productos disponibles.</p>;
  }

  return (
    <div className="product-grid" role="list">
      {productos.map((producto) => (
        <article key={producto.id} className="product-card" role="listitem">
          <div className="product-image-container">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="product-image"
              loading="lazy"
            />
          </div>
          <div className="product-info">
            <h3 className="product-name">{producto.nombre}</h3>
            <p className="product-price">${(producto.precio / 100).toFixed(2)}</p>
            <p className="product-stock">Stock: {producto.stock} {producto.unidad}</p>
          </div>
          <button
            className="btn btn-add"
            onClick={() => onAddToCart(producto)}
            aria-label={`Agregar ${producto.nombre} al carrito`}
          >
            Agregar
          </button>
        </article>
      ))}
    </div>
  );
}

export default ProductList;
