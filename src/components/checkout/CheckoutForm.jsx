import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const DELIVERY_OPTIONS = ["Retiro del local", "Recibe del transporte"];

export default function CheckoutForm() {
  const { cartItems, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    locality: "",
    email: "",
    whatsapp: "",
    observations: "",
    clientNumber: "",
    delivery: DELIVERY_OPTIONS[0],
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    // TODO: conectar con endpoint
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
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

  return (
    <div className="checkout-page">
      <div className="checkout-left">
        <button className="back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> Volver a la tienda
        </button>
        <h2 className="checkout-title">Finalizá tu pedido</h2>
        <p className="checkout-subtitle">Completá todos los campos para confirmar</p>

        <div className="checkout-form">
          <div className="form-group">
            <label>Apellido y Nombres</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Tu nombre completo" />
          </div>
          <div className="form-group">
            <label>Localidad</label>
            <input name="locality" value={form.locality} onChange={handleChange} placeholder="Ciudad / Barrio" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Correo electrónico</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" />
            </div>
            <div className="form-group">
              <label>N° de WhatsApp</label>
              <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+54 9 11 ..." />
            </div>
          </div>
          <div className="form-group">
            <label>Observaciones</label>
            <textarea name="observations" value={form.observations} onChange={handleChange} placeholder="Aclaraciones especiales, horarios, etc." rows={3} />
          </div>
          <div className="form-group">
            <label>
              Número de cliente <span className="label-hint">(de tu última compra, opcional)</span>
            </label>
            <input name="clientNumber" value={form.clientNumber} onChange={handleChange} placeholder="Dejar en blanco si no lo conocés" style={{ maxWidth: 200 }} />
          </div>
          <div className="form-group">
            <label>Modalidad de entrega</label>
            <div className="delivery-options">
              {DELIVERY_OPTIONS.map((opt) => (
                <label key={opt} className={`delivery-option ${form.delivery === opt ? "selected" : ""}`}>
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
        </div>
      </div>

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
                <span className="summary-item-price">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>${total.toLocaleString()}</strong>
          </div>
          <button
            className="submit-order-btn"
            onClick={handleSubmit}
            disabled={!form.fullName || !form.email || !form.whatsapp}
          >
            Enviar pedido
          </button>
          <p className="submit-hint">Te contactaremos para confirmar</p>
        </div>
      </div>
    </div>
  );
}
