import { useState } from 'react';
import ProductList from './components/ProductList';
import SaleForm from './components/SaleForm';

function App() {
  const [cart, setCart] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const addToCart = (product) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productoId === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.productoId === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prevCart, { productoId: product.id, nombre: product.nombre, precio: product.precio, cantidad: 1 }];
    });
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.productoId !== productoId));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productoId === productoId ? { ...item, cantidad } : item
        )
      );
    }
  };

  const removeFromCart = (productoId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productoId !== productoId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleSaleSuccess = (result) => {
    setSuccessMessage(
      `¡Venta registrada! ID: ${result.ventaId} — Total: $${(result.total / 100).toFixed(2)}`
    );
    setErrorMessage(null);
    clearCart();
  };

  const handleSaleError = (error) => {
    setErrorMessage(error.message || 'Error al registrar la venta');
    setSuccessMessage(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 POS — Punto de Venta</h1>
      </header>

      <main className="app-main">
        {successMessage && (
          <div className="message message-success" role="alert">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="message message-error" role="alert">
            {errorMessage}
          </div>
        )}

        <section className="products-section" aria-label="Productos disponibles">
          <h2>Productos</h2>
          <ProductList onAddToCart={addToCart} />
        </section>

        <section className="cart-section" aria-label="Carrito de compras">
          <h2>Carrito</h2>
          <SaleForm
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onSaleSuccess={handleSaleSuccess}
            onSaleError={handleSaleError}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
