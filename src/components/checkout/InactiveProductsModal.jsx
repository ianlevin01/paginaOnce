import { X, AlertTriangle } from "lucide-react";

export default function InactiveProductsModal({ inactiveProducts, onRemove, onKeep, loading }) {
  return (
    <div className="modal-overlay" onClick={onKeep}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onKeep} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="auth-body" style={{ paddingTop: "40px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <AlertTriangle size={48} color="#d97706" strokeWidth={1.5} style={{ marginBottom: "12px" }} />
            <h2 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 8px" }}>
              Productos no disponibles
            </h2>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
              Los siguientes productos no están disponibles actualmente:
            </p>
          </div>

          <div style={{
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            maxHeight: "200px",
            overflowY: "auto"
          }}>
            {inactiveProducts.map((product) => (
              <div key={product.id} style={{
                padding: "8px 0",
                borderBottom: "1px solid #fde68a",
                fontSize: "14px",
                color: "#92400e"
              }}>
                <strong>{product.name}</strong>
                {product.quantity && <span style={{ marginLeft: "8px", color: "#b45309" }}>x{product.quantity}</span>}
              </div>
            ))}
          </div>

          <p style={{ fontSize: "13px", color: "#374151", marginBottom: "24px" }}>
            ¿Deseas eliminarlos del carrito para continuar con tu pedido?
          </p>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onRemove}
              disabled={loading}
              style={{
                flex: 1,
                background: "#059669",
                color: "#fff",
                border: "none",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Eliminando..." : "Sí, eliminarlos"}
            </button>
            <button
              onClick={onKeep}
              disabled={loading}
              style={{
                flex: 1,
                background: "none",
                color: "#d97706",
                border: "2px solid #d97706",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              No, mantenerlos
            </button>
          </div>

          <p style={{
            fontSize: "12px",
            color: "#6b7280",
            textAlign: "center",
            marginTop: "16px",
            fontStyle: "italic"
          }}>
            Si los mantienes, no podrás enviar el pedido hasta que los elimines o se vuelvan disponibles.
          </p>
        </div>
      </div>
    </div>
  );
}
