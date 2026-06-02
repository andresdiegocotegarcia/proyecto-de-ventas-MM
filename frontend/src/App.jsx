import { useState, useEffect } from 'react';
import { fetchProductos, registrarVenta } from './api';
import BarcodeScanner from './components/BarcodeScanner';
import './App.css';

const IVA = 0.16;

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [ventasOpen, setVentasOpen] = useState(false);
  const [ventas, setVentas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [cartIndex, setCartIndex] = useState(0);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null);
  const [factura, setFactura] = useState(null); // Factura post-venta
  const [scannerOpen, setScannerOpen] = useState(false); // Escáner QR

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProductos();
        setProductos(data);
        setConnected(true);
      } catch { setConnected(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'F1') { e.preventDefault(); document.getElementById('searchNum')?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); setCatalogOpen(v => !v); setVentasOpen(false); setFactura(null); }
      if (e.key === 'F3') { e.preventDefault(); setCartOpen(v => !v); }
      if (e.key === 'F4') { e.preventDefault(); handleCheckout(); }
      if (e.key === 'F5') { e.preventDefault(); setVentasOpen(v => !v); setCatalogOpen(false); setFactura(null); if (!ventasOpen) loadVentas(); }
      if (e.key === 'F6') { e.preventDefault(); setScannerOpen(v => !v); }
      if (e.key === 'Escape') { e.preventDefault(); setFactura(null); setCartOpen(false); setScannerOpen(false); }

      if (cartOpen && carrito.length > 0) {
        if (e.key === 'ArrowUp') { e.preventDefault(); setCartIndex(i => Math.max(0, i - 1)); }
        if (e.key === 'ArrowDown') { e.preventDefault(); setCartIndex(i => Math.min(carrito.length - 1, i + 1)); }
        if (e.key === '+' || e.key === 'ArrowRight') { e.preventDefault(); cambiarCantidad(carrito[cartIndex]?.productoId, 1); }
        if (e.key === '-' || e.key === 'ArrowLeft') { e.preventDefault(); cambiarCantidad(carrito[cartIndex]?.productoId, -1); }
        if (e.key === 'Delete') { e.preventDefault(); quitarDelCarrito(carrito[cartIndex]?.productoId); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const fmt = (n) => '$' + ((n || 0) / 100).toFixed(2);
  const fmtConIva = (n) => '$' + (((n || 0) / 100) * (1 + IVA)).toFixed(2);
  const calcIva = (n) => ((n || 0) / 100) * IVA;
  const calcTotal = (n) => ((n || 0) / 100) * (1 + IVA);

  const buscar = () => {
    const num = parseInt(document.getElementById('searchNum').value);
    const qty = parseInt(document.getElementById('searchQty').value) || 1;
    if (!num || num < 1) { setResultado({ error: 'Número inválido' }); return; }
    const id = String(num);
    const p = productos.find(x => x.id === id);
    if (!p) { setResultado({ error: `No existe el producto ${id}` }); return; }
    agregarAlCarrito(p, qty);
    setResultado({ product: p, qty });
    document.getElementById('searchNum').value = '';
    document.getElementById('searchQty').value = '1';
    document.getElementById('searchNum').focus();
  };

  const agregarAlCarrito = (p, qty = 1) => {
    setCarrito(prev => {
      const exists = prev.find(c => c.productoId === p.id);
      if (exists) return prev.map(c => c.productoId === p.id ? { ...c, cantidad: c.cantidad + qty } : c);
      return [...prev, { productoId: p.id, nombre: p.nombre, precio: p.precio, cantidad: qty }];
    });
    setToast({ msg: `+ ${qty} ${p.nombre}`, type: 'ok' });
  };

  const quitarDelCarrito = (id) => setCarrito(prev => prev.filter(c => c.productoId !== id));

  const cambiarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(c => {
      if (c.productoId !== id) return c;
      const newQty = c.cantidad + delta;
      return newQty < 1 ? c : { ...c, cantidad: newQty };
    }));
  };

  const handleCheckout = async () => {
    if (carrito.length === 0) { setToast({ msg: 'Carrito vacío', type: 'err' }); return; }
    try {
      const items = carrito.map(({ productoId, cantidad }) => ({ productoId, cantidad }));
      const result = await registrarVenta(items, 'efectivo');

      // Generar factura local con IVA
      const facturaItems = carrito.map(c => ({
        nombre: c.nombre,
        cantidad: c.cantidad,
        precioUnitario: c.precio,
        subtotal: c.precio * c.cantidad
      }));
      const subtotalCentavos = facturaItems.reduce((s, i) => s + i.subtotal, 0);
      const ivaCentavos = Math.round(subtotalCentavos * IVA);
      const totalCentavos = subtotalCentavos + ivaCentavos;

      setFactura({
        ventaId: result.ventaId,
        estado: result.estado || 'REGISTRADA',
        fecha: new Date().toLocaleString('es'),
        items: facturaItems,
        subtotal: subtotalCentavos,
        iva: ivaCentavos,
        total: totalCentavos
      });

      setToast({ msg: '✓ Venta registrada exitosamente', type: 'ok' });
      setCarrito([]);
      setCartOpen(false);
      setResultado(null);
    } catch (err) {
      setToast({ msg: err.message || 'Error al registrar', type: 'err' });
    }
  };

  const loadVentas = async () => {
    try {
      const r = await fetch(import.meta.env.VITE_API_URL + '/ventas');
      if (r.ok) { const data = await r.json(); setVentas(Array.isArray(data) ? data : []); }
    } catch { setVentas([]); }
  };

  // Procesar código escaneado (busca por codigoBarras o por ID)
  const handleScan = (code) => {
    setScannerOpen(false);
    // Buscar por codigoBarras
    let p = productos.find(x => x.codigoBarras === code);
    // Si no encuentra, intentar por ID
    if (!p) p = productos.find(x => x.id === code);
    if (p) {
      agregarAlCarrito(p, 1);
      setResultado({ product: p, qty: 1 });
      setToast({ msg: `📷 Escaneado: ${p.nombre}`, type: 'ok' });
    } else {
      setResultado({ error: `Código "${code}" no encontrado` });
      setToast({ msg: `Código no reconocido: ${code}`, type: 'err' });
    }
  };

  const cartCount = carrito.reduce((s, c) => s + c.cantidad, 0);
  const cartSubtotal = carrito.reduce((s, c) => s + c.precio * c.cantidad, 0);
  const cartIva = Math.round(cartSubtotal * IVA);
  const cartTotal = cartSubtotal + cartIva;

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">🛒 <span>POS Supermercado</span></div>
          <div className="shortcuts">
            <span><kbd>F1</kbd> Buscar</span>
            <span><kbd>F2</kbd> Catálogo</span>
            <span><kbd>F3</kbd> Carrito <b className={cartCount > 0 ? 'badge' : 'badge empty'}>{cartCount}</b></span>
            <span><kbd>F4</kbd> Vender</span>
            <span><kbd>F5</kbd> Ventas</span>
            <span><kbd>F6</kbd> Escáner</span>
          </div>
          <div className="status">
            <span className={`dot ${connected ? 'on' : 'off'}`}></span>
            {connected ? 'Conectado' : 'Sin conexión'}
          </div>
        </div>
      </header>

      <main className="main">
        {/* BÚSQUEDA */}
        <section className="search-section">
          <h1>Buscar producto</h1>
          <div className="search-bar">
            <span className="prefix">ID:</span>
            <input id="searchNum" type="number" placeholder="1" min="1" onKeyDown={(e) => e.key === 'Enter' && buscar()} />
            <input id="searchQty" type="number" placeholder="Cant." min="1" defaultValue="1" className="qty-input" onKeyDown={(e) => e.key === 'Enter' && buscar()} />
            <button onClick={buscar}>Agregar</button>
          </div>
          <p className="hint-text">ID del producto + cantidad → Enter · Precios incluyen IVA 16%</p>
        </section>

        {/* RESULTADO */}
        {resultado && (
          <div className={`resultado ${resultado.error ? 'error' : ''}`}>
            {resultado.error ? (
              <div className="error-msg">✕ {resultado.error}</div>
            ) : (
              <div className="info">
                <div className="name">{resultado.product.nombre}</div>
                <div className="price">{fmtConIva(resultado.product.precio)} <small className="iva-tag">IVA incl.</small></div>
                <div className="price-detail">Base: {fmt(resultado.product.precio)} + IVA: ${calcIva(resultado.product.precio).toFixed(2)}</div>
                <div className="added-msg">✓ {resultado.qty} unidad{resultado.qty > 1 ? 'es' : ''} agregada{resultado.qty > 1 ? 's' : ''} al carrito</div>
              </div>
            )}
          </div>
        )}

        {/* FACTURA POST-VENTA */}
        {factura && (
          <div className="factura-popup">
            <div className="factura-popup-card">
              <div className="factura-popup-header">
                <h2>🧾 Factura de Venta</h2>
                <button className="factura-close" onClick={() => setFactura(null)}>✕</button>
              </div>
              <div className="factura-popup-meta">
                <div><strong>ID:</strong> {factura.ventaId}</div>
                <div><strong>Estado:</strong> {factura.estado}</div>
                <div><strong>Fecha:</strong> {factura.fecha}</div>
              </div>
              <table className="factura-table">
                <thead>
                  <tr><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                  {factura.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>{fmt(item.precioUnitario)}</td>
                      <td>{fmt(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="factura-popup-totals">
                <div className="factura-line"><span>Subtotal</span><span>{fmt(factura.subtotal)}</span></div>
                <div className="factura-line"><span>IVA (16%)</span><span>{fmt(factura.iva)}</span></div>
                <div className="factura-line factura-grand-total"><span>TOTAL</span><span>{fmt(factura.total)}</span></div>
              </div>
              <button className="factura-nueva-btn" onClick={() => { setFactura(null); document.getElementById('searchNum')?.focus(); }}>
                Nueva venta (F1)
              </button>
            </div>
          </div>
        )}

        {/* CATÁLOGO (F2) */}
        {catalogOpen && (
          <section className="catalog-section">
            <div className="section-header">
              <h2>Catálogo de productos</h2>
              <span className="hint-inline"><kbd>F2</kbd> para cerrar</span>
            </div>
            <div className="grid">
              {productos.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })).map(p => (
                <div key={p.id} className="card" onClick={() => agregarAlCarrito(p, 1)}>
                  {p.imagen && <img src={p.imagen} alt={p.nombre} className="card-img" loading="lazy" />}
                  <div className="card-name">{p.nombre}</div>
                  <div className="card-price">{fmtConIva(p.precio)} <small className="iva-tag">IVA</small></div>
                  <span className="card-id">ID: {p.id}</span>
                  <button className="card-add" onClick={(e) => { e.stopPropagation(); agregarAlCarrito(p, 1); }}>+ Agregar</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VENTAS (F5) */}
        {ventasOpen && (
          <section className="ventas-section">
            <div className="section-header">
              <h2>🧾 Historial de ventas</h2>
              <span className="hint-inline"><kbd>F5</kbd> para cerrar</span>
            </div>
            {ventas.length === 0 ? (
              <p className="empty-msg">No hay ventas registradas</p>
            ) : (
              <div className="facturas-grid">
                {ventas.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')).map(v => {
                  const sub = v.total || 0;
                  const ivaV = Math.round(sub * IVA);
                  const totalV = sub + ivaV;
                  return (
                    <div key={v.id} className="factura">
                      <div className="factura-header">
                        <span className="factura-id">{v.id?.substring(0, 8)}...</span>
                        <span className="factura-badge">REGISTRADA</span>
                      </div>
                      <div className="factura-body">
                        {v.items?.map((item, i) => (
                          <div key={i} className="factura-item">
                            <span>{item.nombre}</span>
                            <span>×{item.cantidad}</span>
                            <span>{fmt(item.subtotal)}</span>
                          </div>
                        ))}
                        <div className="factura-divider"></div>
                        <div className="factura-line-sm"><span>Subtotal</span><span>{fmt(sub)}</span></div>
                        <div className="factura-line-sm"><span>IVA 16%</span><span>{fmt(ivaV)}</span></div>
                        <div className="factura-total">Total: {fmt(totalV)}</div>
                        <div className="factura-fecha">{v.fecha ? new Date(v.fecha).toLocaleString('es') : '—'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {!catalogOpen && !ventasOpen && !factura && (
          <div className="hints-bottom">
            <kbd>F1</kbd> Buscar · <kbd>F2</kbd> Catálogo · <kbd>F3</kbd> Carrito · <kbd>F5</kbd> Ventas
          </div>
        )}
      </main>

      {/* CARRITO LATERAL (F3) */}
      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}></div>}
      <aside className={`cart-panel ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>🛒 Carrito</h2>
          <span className="cart-shortcuts"><kbd>↑↓</kbd> Nav · <kbd>+−</kbd> Cant · <kbd>Supr</kbd> Quitar</span>
        </div>
        <div className="cart-body">
          {carrito.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Carrito vacío</p>
              <span><kbd>F1</kbd> para buscar productos</span>
            </div>
          ) : (
            carrito.map((c, i) => (
              <div key={c.productoId} className={`cart-item ${i === cartIndex ? 'selected' : ''}`}>
                <div className="ci-info">
                  <div className="ci-name">{c.nombre}</div>
                  <div className="ci-price">{fmt(c.precio)} + IVA</div>
                </div>
                <div className="ci-controls">
                  <button onClick={() => cambiarCantidad(c.productoId, -1)}>−</button>
                  <span className="ci-qty">{c.cantidad}</span>
                  <button onClick={() => cambiarCantidad(c.productoId, 1)}>+</button>
                </div>
                <span className="ci-subtotal">{fmtConIva(c.precio * c.cantidad)}</span>
                <button className="ci-remove" onClick={() => quitarDelCarrito(c.productoId)}>🗑</button>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="cart-desglose">
            <div className="desglose-row"><span>Subtotal</span><span>{fmt(cartSubtotal)}</span></div>
            <div className="desglose-row"><span>IVA (16%)</span><span>{fmt(cartIva)}</span></div>
          </div>
          <div className="cart-total-row"><span>Total</span><strong>{fmt(cartTotal)}</strong></div>
          <button className="checkout-btn" disabled={carrito.length === 0} onClick={handleCheckout}>
            F4 — Confirmar Venta
          </button>
        </div>
      </aside>

      {/* ESCÁNER (F6) */}
      {scannerOpen && <BarcodeScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

export default App;
