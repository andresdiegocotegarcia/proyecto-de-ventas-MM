export const API_URL = import.meta.env.VITE_API_URL;

export async function fetchProductos() {
  try {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`);
    }
    const data = await response.json();
    return data.productos || data;
  } catch (error) {
    console.error('fetchProductos error:', error);
    throw error;
  }
}

export async function registrarVenta(items, medioPago) {
  try {
    const response = await fetch(`${API_URL}/ventas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items, medioPago })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al registrar venta: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('registrarVenta error:', error);
    throw error;
  }
}
