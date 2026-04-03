// components/auth/AuthModal.jsx
import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode]       = useState("login"); // "login" | "register"
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(null); }}
          >
            <LogIn size={15} /> Iniciar sesión
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setError(null); }}
          >
            <UserPlus size={15} /> Registrarse
          </button>
        </div>

        <div className="auth-body">
          <p className="auth-subtitle">
            {mode === "login"
              ? "Accedé a tus favoritos y pedidos anteriores."
              : "Creá tu cuenta para guardar favoritos y ver tus pedidos."}
          </p>

          {mode === "register" && (
            <div className="auth-field">
              <label className="auth-label">Nombre (opcional)</label>
              <div className="auth-input-wrap">
                <User size={16} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>
            </div>
          )}

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

          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                className="auth-input auth-input--pass"
                type={showPass ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            disabled={loading || !email || !password}
          >
            {loading
              ? "Cargando..."
              : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
