import { useState } from "react";
import { X, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPasswordModal({ onClose, onSuccess }) {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email || !email.trim()) {
      setError("Por favor ingresá tu email.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 3000);
    } catch (err) {
      setError(err.message || "Error al solicitar restablecimiento de contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !loading && !success) submit(); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="auth-body" style={{ paddingTop: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 20px", textAlign: "center" }}>
            🔐 Restablecer contraseña
          </h2>

          {!success ? (
            <>
              <p className="auth-subtitle" style={{ marginBottom: "24px" }}>
                Ingresá tu email y te enviaremos un enlace para crear una nueva contraseña.
              </p>

              <div className="auth-field">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKey}
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                className="auth-submit-btn"
                onClick={submit}
                disabled={loading || !email.trim()}
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
              <p style={{ fontSize: "15px", fontWeight: "600", marginBottom: "8px", color: "#059669" }}>
                ¡Enlace enviado!
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>
                Revisa tu correo y haz clic en el enlace para restablecer tu contraseña.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
