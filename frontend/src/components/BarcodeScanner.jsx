import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('scanner-container');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      (decodedText) => {
        // Código escaneado exitosamente
        scanner.stop().then(() => {
          onScan(decodedText);
        }).catch(() => {});
      },
      () => {} // Ignorar errores de no-detección
    ).catch((err) => {
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="scanner-overlay">
      <div className="scanner-card">
        <div className="scanner-header">
          <h2>📷 Escáner de código</h2>
          <button className="scanner-close" onClick={onClose}>✕</button>
        </div>
        <p className="scanner-hint">Apunta la cámara al código de barras o QR del producto</p>
        {error ? (
          <div className="scanner-error">{error}</div>
        ) : (
          <div id="scanner-container" className="scanner-view"></div>
        )}
        <div className="scanner-footer">
          <span>Presiona <kbd>F6</kbd> o <kbd>Esc</kbd> para cerrar</span>
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;
