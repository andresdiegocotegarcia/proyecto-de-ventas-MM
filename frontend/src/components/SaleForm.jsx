import { useState } from 'react';
import { registrarVenta } from '../api';

function SaleForm({ cart, onUpdateQuantity, onRemoveItem, onSaleSuccess, onSaleError }) {
  const [medioPago, setMedioPago] = useState('efectivo');
  const [submitting, setSubmitting] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      onSaleError({ message: 'El carrito está vacío' });
      return;
    }

    try {
      setSubmitting(true);
      const items = cart.map(({ productoId, cantidad }) => ({ productoId, cantidad }));
      const result = await registrarVenta(items, medioPago);
      onSaleSuccess(result);
    } catch (error) {
      onSaleError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return <p className="cart-empty">No hay productos en el carrito.</p>;
  }

  return (
    <form className="sale-form" onSubmit={handleSubmit}>
      <ul className="cart-list" aria-label="Items en el carrito">
        {cart.map((item) => (
          <li key={item.productoId} className="cart-item">
            <span className="cart-item-name">{item.nombre}</span>
            <div className="cart-item-controls">
              <button
                type="button"
                className="btn btn-qty"
                onClick={() => onUpdateQuantity(item.productoId, item.cantidad - 1)}
                aria-label={`Reducir cantidad de ${item.nombre}`}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={item.cantidad}
                onChange={(e) =>
                  onUpdateQuantity(item.productoId, parseInt(e.target.value, 10) || 1)
                }
                className="cart-item-qty"
                aria-label={`Cantidad de ${item.nombre}`}
              />
              <button
                type="button"
                className="btn btn-qty"
                onClick={() => onUpdateQuantity(item.productoId, item.cantidad + 1)}
                aria-label={`Aumentar cantidad de ${item.nombre}`}
              >
                +
              </button>
              <span className="cart-item-subtotal">
                ${((item.precio * item.cantidad) / 100).toFixed(2)}
              </span>
              <button
                type="button"
                className="btn btn-remove"
                onClick={() => onRemoveItem(item.productoId)}
                aria-label={`Eliminar ${item.nombre} del carrito`}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-total">
        <strong>Total: ${(total / 100).toFixed(2)}</strong>
      </div>

      <div className="form-group">
        <label htmlFor="medioPago">Método de pago:</label>
        <select
          id="medioPago"
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          className="select-medio-pago"
        >
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      <button
        type="submit"
        className="btn btn-submit"
        disabled={submitting}
      >
        {submitting ? 'Procesando...' : 'Registrar Venta'}
      </button>
    </form>
  );
}

export default SaleForm;
