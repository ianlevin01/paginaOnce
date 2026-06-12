// components/checkout/CheckoutForm.jsx
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, ArrowLeft, Plus, Minus, Trash2,
  LogIn, UserPlus
} from "lucide-react";
import AuthModal from "../auth/AuthModal";

const API_URL    = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const NEGOCIO_ID = "00000000-0000-0000-0000-000000000001";
const DELIVERY_OPTIONS = ["Retiro del local", "Recibe del transporte"];
const PLACEHOLDER = "https://placehold.co/400x400?text=Sin+imagen";

// ── Mini editor de ítem del carrito ──────────────────────────────────────────
function CheckoutCartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  return (
    <div className="co-cart-item">
      <img
        src={item.image ?? PLACEHOLDER}
        alt={item.name}
        className="co-cart-item-img"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
      />
      <div className="co-cart-item-info">
        <p className="co-cart-item-name">{item.name}</p>
        <span className="co-cart-item-unit">${Number(item.price ?? 0).toLocaleString("es-AR")} c/u</span>
      </div>
      <div className="co-cart-item-controls">
        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Restar">
          <Minus size={13} />
        </button>
        <span className="qty-value">{item.quantity}</span>
        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Sumar">
          <Plus size={13} />
        </button>
      </div>
      <span className="co-cart-item-price">
        ${(Number(item.price ?? 0) * item.quantity).toLocaleString("es-AR")}
      </span>
      <button className="co-cart-item-remove" onClick={() => removeFromCart(item.id)} aria-label="Eliminar">
        <Trash2 size={15} />
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CheckoutForm() {
  const { cartItems, total, clearCart } = useCart();
  const { user, isLoggedIn, token, logout } = useAuth();
  const navigate = useNavigate();

  const [step,            setStep]            = useState("form");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [showAuthModal,   setShowAuthModal]   = useState(false);
  // guestChosen: false = mostrando pantalla de elección, true = mostrando formulario
  const [guestChosen,     setGuestChosen]     = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [form, setForm] = useState({
    delivery:     DELIVERY_OPTIONS[0],
    observations: "",
    firstName:    "",
    lastName:     "",
    locality:     "",
    email:        "",
    whatsapp:     "",
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Validación guest
  const hasFirstName = form.firstName.trim().length > 0;
  const hasLastName  = form.lastName.trim().length > 0;
  const hasContact   = form.email.trim().length > 0 || form.whatsapp.trim().length > 0;
  const guestValid   = isLoggedIn || (guestChosen && hasFirstName && hasLastName && hasContact);
  const canSubmit    = !loading && cartItems.length > 0 && guestValid;

  // Avanzar al formulario guest y volver al tope de la página
  const handleContinueAsGuest = () => {
    setGuestChosen(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleSubmit = async () => {
    if (!isLoggedIn && !guestChosen) {
      handleContinueAsGuest();
      return;
    }
    if (!guestValid) {
      setSubmitAttempted(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = {
        negocio_id: NEGOCIO_ID,
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

      const headers = { "Content-Type": "application/json" };

      if (isLoggedIn && token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        body.customer_name     = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
        body.customer_email    = form.email.trim();
        body.customer_phone    = form.whatsapp.trim();
        body.customer_locality = form.locality.trim();
      }

      const res = await fetch(`${API_URL}/api/web-orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        // Si es 401 (sesión expirada), desloguear y mostrar mensaje
        if (res.status === 401) {
          setError(data.message || "Sesión expirada. Por favor, inicia sesión nuevamente.");
          setTimeout(() => {
            logout();
            window.location.reload();
          }, 2000);
          return;
        }
        throw new Error(data.message || "Error al enviar el pedido");
      }

      clearCart();
      setStep("success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="checkout-success">
        <CheckCircle2 size={64} strokeWidth={1.5} />
        <h2>¡Pedido enviado!</h2>
        <p>Te contactaremos pronto por WhatsApp para confirmar tu pedido.</p>
        {isLoggedIn && (
          <p style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: -12, marginBottom: 24 }}>
            Podés ver este pedido en <strong>Mis pedidos</strong> desde el menú de tu cuenta.
          </p>
        )}
        <button className="back-shop-btn" onClick={() => navigate("/")}>
          Seguir comprando
        </button>
      </div>
    );
  }

  // Texto del botón mobile
  const mobileBarLabel = loading
    ? "Enviando..."
    : (!isLoggedIn && !guestChosen)
      ? "Continuar sin cuenta"
      : "Enviar pedido";

  return (
    <div className="checkout-page">

      {/* ── Columna izquierda ─────────────────────────────────────────────── */}
      <div className="checkout-left">
        <button className="back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> Volver a la tienda
        </button>
        <h2 className="checkout-title">Finalizá tu pedido</h2>

        {/* ── Caso A: logueado ── */}
        {isLoggedIn ? (
          <>
            <div className="logged-user-banner">
              <div className="logged-user-avatar">
                {((user.name || user.email || "?")[0] ?? "?").toUpperCase()}
              </div>
              <div>
                <p className="logged-user-name">{user.name || user.email?.split("@")[0] || ""}</p>
                <span className="logged-user-email">{user.email}</span>
              </div>
            </div>

            <div className="co-cart-section">
              <h3 className="co-cart-title">Productos en tu pedido</h3>
              {cartItems.length === 0 ? (
                <p style={{ color: "var(--ink-muted)", fontSize: 14 }}>Tu carrito está vacío.</p>
              ) : (
                <div className="co-cart-list">
                  {cartItems.map((item) => <CheckoutCartItem key={item.id} item={item} />)}
                </div>
              )}
            </div>

            <div className="checkout-form">
              <div className="form-group">
                <label>Modalidad de entrega</label>
                <div className="delivery-options">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <label key={opt} className={`delivery-option ${form.delivery === opt ? "selected" : ""}`}>
                      <input type="radio" name="delivery" value={opt} checked={form.delivery === opt} onChange={handleChange} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Observaciones</label>
                <textarea name="observations" value={form.observations} onChange={handleChange}
                  placeholder="Aclaraciones especiales, horarios, etc." rows={3} />
              </div>
            </div>
          </>

        ) : !guestChosen ? (
          /* ── Caso B: pantalla de elección (login o guest) ── */
          <div className="register-prompt">
            <div className="register-prompt-icon">
              <UserPlus size={22} />
            </div>
            <div className="register-prompt-text">
              <p className="register-prompt-title">¿Cómo querés continuar?</p>
              <p className="register-prompt-sub">
                Iniciá sesión para ver tu historial de pedidos, o continuá sin cuenta.
              </p>
            </div>
            <div className="register-prompt-actions">
              <button
                className="register-prompt-btn register-prompt-btn--primary"
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn size={15} /> Ingresar / Registrarse
              </button>
              <button
                className="register-prompt-btn register-prompt-btn--ghost"
                onClick={handleContinueAsGuest}
              >
                Continuar sin cuenta
              </button>
            </div>
          </div>

        ) : (
          /* ── Caso C: formulario guest ── */
          <div className="checkout-form">
            <p className="checkout-subtitle">Completá tus datos para confirmar el pedido</p>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre <span className="label-hint">*</span></label>
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Juan"
                  className={submitAttempted && !hasFirstName ? "input-error" : ""} autoFocus />
                {submitAttempted && !hasFirstName && <span className="field-error">Ingresá tu nombre</span>}
              </div>
              <div className="form-group">
                <label>Apellido <span className="label-hint">*</span></label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="García"
                  className={submitAttempted && !hasLastName ? "input-error" : ""} />
                {submitAttempted && !hasLastName && <span className="field-error">Ingresá tu apellido</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Localidad</label>
              <input name="locality" value={form.locality} onChange={handleChange} placeholder="Ciudad / Barrio" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Correo electrónico <span className="label-hint">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com"
                  className={submitAttempted && !hasContact ? "input-error" : ""} />
              </div>
              <div className="form-group">
                <label>N° de WhatsApp <span className="label-hint">*</span></label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+54 9 11 ..."
                  className={submitAttempted && !hasContact ? "input-error" : ""} />
              </div>
            </div>
            {submitAttempted && !hasContact && (
              <span className="field-error">Ingresá tu email o número de WhatsApp</span>
            )}

            <div className="form-group">
              <label>Modalidad de entrega</label>
              <div className="delivery-options">
                {DELIVERY_OPTIONS.map((opt) => (
                  <label key={opt} className={`delivery-option ${form.delivery === opt ? "selected" : ""}`}>
                    <input type="radio" name="delivery" value={opt} checked={form.delivery === opt} onChange={handleChange} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Observaciones</label>
              <textarea name="observations" value={form.observations} onChange={handleChange}
                placeholder="Aclaraciones especiales, horarios, etc." rows={3} />
            </div>
          </div>
        )}

        {error && <div className="checkout-error-banner">⚠ {error}</div>}
      </div>

      {/* ── Resumen del pedido (columna derecha / oculto en mobile) ───────── */}
      <div className="checkout-right">
        <div className="order-summary">
          <h3>Resumen del pedido</h3>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <img src={item.image ?? PLACEHOLDER} alt={item.name}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                <div className="summary-item-info">
                  <p>{item.name}</p>
                  <span>x{item.quantity}</span>
                </div>
                <span className="summary-item-price">
                  ${(Number(item.price ?? 0) * item.quantity).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>${total.toLocaleString("es-AR")}</strong>
          </div>
          <button className="submit-order-btn" onClick={handleSubmit} disabled={!canSubmit && guestChosen}>
            {loading ? "Enviando..." : (!isLoggedIn && !guestChosen) ? "Continuar sin cuenta" : "Enviar pedido"}
          </button>
          <p className="submit-hint">Te contactaremos para confirmar</p>
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Barra sticky mobile */}
      <div className="checkout-mobile-bar">
        <div className="checkout-mobile-bar-total">
          Total <strong>${total.toLocaleString("es-AR")}</strong>
        </div>
        <button
          className="checkout-mobile-bar-btn"
          onClick={handleSubmit}
          disabled={loading || (guestChosen && !guestValid)}
        >
          {mobileBarLabel}
        </button>
      </div>
    </div>
  );
}
