import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const DELIVERY_OPTIONS = ["Retiro del local", "Recibe del transporte"];

export default function CheckoutForm() {
  const { cartItems, total, clearCart } = useCart();
  const navigate  = useNavigate();
  const [step, setStep]       = useState("form"); // "form" | "success" | "new_customer"
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [newCustomer, setNewCustomer] = useState(null); // datos del customer creado

  const [form, setForm] = useState({
    fullName:     "",
    locality:     "",
    email:        "",
    whatsapp:     "",
    observations: "",
    clientNumber: "",  // ID de cliente existente (opcional)
    delivery:     DELIVERY_OPTIONS[0],
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Armar el body según si tiene número de cliente o no
      const body = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          name:       item.name,
          code:       item.code || null,
          quantity:   item.quantity,
          unit_price: item.price,
        })),
        observaciones: [
          form.observations,
          form.delivery !== DELIVERY_OPTIONS[0] ? `Entrega: ${form.delivery}` : null,
        ].filter(Boolean).join(" | ") || null,
      };

      if (form.clientNumber.trim()) {
        // Cliente existente — mandar su ID
        body.customer_id = form.clientNumber.trim();
      } else {
        // Cliente nuevo — mandar sus datos
        body.customer_name  = form.fullName.trim();
        body.customer_email = form.email.trim();
        body.customer_phone = form.whatsapp.trim();
      }

      const res = await fetch(`${API_URL}/api/web-orders`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al enviar el pedido");
      }

      const data = await res.json();
      clearCart();

      // Si se creó un customer nuevo, mostrar pantalla especial con su ID
      if (data.new_customer) {
        setNewCustomer(data.new_customer);
        setStep("new_customer");
      } else {
        setStep("success");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Pantalla: cliente nuevo creado ────────────────────────────────────────
  if (step === "new_customer") {
    return (
      <div className="checkout-success">
        <CheckCircle2 size={64} strokeWidth={1.5} />
        <h2>¡Pedido enviado!</h2>
        <p>Te contactaremos pronto por WhatsApp para confirmar tu pedido.</p>

        <div style={{
          margin: "24px auto",
          padding: "20px 28px",
          background: "#f0fdf4",
          border: "1.5px solid #86efac",
          borderRadius: 12,
          maxWidth: 360,
          textAlign: "left",
        }}>
          <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>
            🎉 ¡Tu número de cliente es:
          </p>
          <p style={{
            fontFamily: "monospace",
            fontSize: 13,
            background: "#fff",
            border: "1px solid #86efac",
            borderRadius: 8,
            padding: "10px 14px",
            wordBreak: "break-all",
            color: "#166534",
            fontWeight: 700,
          }}>
            {newCustomer.codigo || newCustomer.id}
          </p>
          <p style={{ fontSize: 13, color: "#166534", marginTop: 10 }}>
            Guardalo para tus próximas compras y así acumular tu historial.
          </p>
        </div>

        <button className="back-shop-btn" onClick={() => navigate("/")}>
          Seguir comprando
        </button>
      </div>
    );
  }

  // ── Pantalla: éxito (cliente existente) ───────────────────────────────────
  if (step === "success") {
    return (
      <div className="checkout-success">
        <CheckCircle2 size={64} strokeWidth={1.5} />
        <h2>¡Pedido enviado!</h2>
        <p>Te contactaremos pronto por WhatsApp para confirmar tu pedido.</p>
        <button className="back-shop-btn" onClick={() => navigate("/")}>
          Seguir comprando
        </button>
      </div>
    );
  }

  // ── Formulario ────────────────────────────────────────────────────────────
  const tieneClienteId = form.clientNumber.trim().length > 0;
  const canSubmit = !loading && cartItems.length > 0 && (
    tieneClienteId || (form.fullName && form.email && form.whatsapp)
  );

  return (
    <div className="checkout-page">
      <div className="checkout-left">
        <button className="back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> Volver a la tienda
        </button>
        <h2 className="checkout-title">Finalizá tu pedido</h2>
        <p className="checkout-subtitle">Completá todos los campos para confirmar</p>

        <div className="checkout-form">

          {/* Número de cliente existente */}
          <div className="form-group">
            <label>
              Número de cliente{" "}
              <span className="label-hint">(de tu última compra, opcional)</span>
            </label>
            <input
              name="clientNumber"
              value={form.clientNumber}
              onChange={handleChange}
              placeholder="Dejar en blanco si no lo conocés"
              style={{ maxWidth: 280 }}
            />
          </div>

          {/* Si tiene número de cliente, no pedimos más datos */}
          {tieneClienteId ? (
            <div style={{
              padding: "14px 18px",
              background: "var(--accent-light)",
              border: "1.5px solid var(--accent)",
              borderRadius: 10,
              fontSize: 14,
              color: "var(--accent)",
              fontWeight: 500,
            }}>
              ✓ Usaremos los datos de tu cuenta. Si el número no es correcto, borralo y completá tus datos manualmente.
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Apellido y Nombres <span className="label-hint">*</span></label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                />
              </div>
              <div className="form-group">
                <label>Localidad</label>
                <input
                  name="locality"
                  value={form.locality}
                  onChange={handleChange}
                  placeholder="Ciudad / Barrio"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Correo electrónico <span className="label-hint">*</span></label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="form-group">
                  <label>N° de WhatsApp <span className="label-hint">*</span></label>
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="+54 9 11 ..."
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Observaciones</label>
            <textarea
              name="observations"
              value={form.observations}
              onChange={handleChange}
              placeholder="Aclaraciones especiales, horarios, etc."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Modalidad de entrega</label>
            <div className="delivery-options">
              {DELIVERY_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`delivery-option ${form.delivery === opt ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={opt}
                    checked={form.delivery === opt}
                    onChange={handleChange}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1.5px solid #fca5a5",
              borderRadius: 8,
              color: "#dc2626",
              fontSize: 14,
            }}>
              ⚠ {error}
            </div>
          )}
        </div>
      </div>

      {/* ── Resumen del pedido ─────────────────────────────────────────────── */}
      <div className="checkout-right">
        <div className="order-summary">
          <h3>Resumen del pedido</h3>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <img src={item.image} alt={item.name} />
                <div className="summary-item-info">
                  <p>{item.name}</p>
                  <span>x{item.quantity}</span>
                </div>
                <span className="summary-item-price">
                  ${(item.price * item.quantity).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>${total.toLocaleString("es-AR")}</strong>
          </div>
          <button
            className="submit-order-btn"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? "Enviando..." : "Enviar pedido"}
          </button>
          <p className="submit-hint">Te contactaremos para confirmar</p>
        </div>
      </div>
    </div>
  );
}
