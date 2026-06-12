import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
    }
  }, [token]);

  const submit = async () => {
    setError(null);

    if (!password || !password.trim()) {
      setError("Por favor ingresá una contraseña.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/", { state: { showAuthModal: true } });
      }, 2000);
    } catch (err) {
      setError(err.message || "Error al restablecer contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !loading && !success) submit(); };

  if (invalidToken) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f4fa",
        padding: "20px",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "40px",
          textAlign: "center",
          maxWidth: "400px",
          boxShadow: "0 4px 24px rgba(13,27,46,.10)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔗</div>
          <h1 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>Enlace inválido</h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
            El enlace de restablecimiento de contraseña es inválido o ha expirado. Por favor, solicita uno nuevo.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#1d4ed8",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f0f4fa",
      padding: "20px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "40px",
        maxWidth: "400px",
        width: "100%",
        boxShadow: "0 4px 24px rgba(13,27,46,.10)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔐</div>
          <h1 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 8px" }}>
            Restablecer contraseña
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>
            Crea una nueva contraseña segura para tu cuenta.
          </p>
        </div>

        {!success ? (
          <>
            <div className="auth-field">
              <label className="auth-label">Nueva contraseña</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  className="auth-input auth-input--pass"
                  type={showPass ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  autoFocus
                />
                <button
                  className="auth-eye-btn"
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirmar contraseña</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  className="auth-input auth-input--pass"
                  type={showPass ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button
                  className="auth-eye-btn"
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="auth-submit-btn"
              onClick={submit}
              disabled={loading || !password.trim() || !confirmPassword.trim()}
            >
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
            <p style={{ fontSize: "15px", fontWeight: "600", marginBottom: "8px", color: "#059669" }}>
              ¡Contraseña actualizada!
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              Serás redirigido al inicio de sesión en unos momentos...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
