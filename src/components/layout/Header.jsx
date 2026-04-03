// components/layout/Header.jsx
import { useState, useRef, useEffect } from "react";
import { ShoppingBag, LogOut, Package, Heart, ChevronDown, LogIn } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthModal from "../auth/AuthModal";
import OrdersDrawer from "../orders/OrdersDrawer";

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isLoggedIn, logout, favorites } = useAuth();
  const navigate = useNavigate();

  const [showAuthModal,    setShowAuthModal]    = useState(false);
  const [showUserMenu,     setShowUserMenu]     = useState(false);
  const [showOrdersDrawer, setShowOrdersDrawer] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <span className="logo-mark">●</span>
            <span className="logo-text">MERCADO<strong>LOCAL</strong></span>
          </div>

          <div className="header-actions">
            {isLoggedIn ? (
              <div className="user-menu-wrap" ref={menuRef}>
                <button
                  className="user-menu-btn"
                  onClick={() => setShowUserMenu((v) => !v)}
                >
                  <div className="user-avatar">
                    {(user.name ?? user.email)[0].toUpperCase()}
                  </div>
                  <span className="user-name-label">
                    {user.name ?? user.email.split("@")[0]}
                  </span>
                  <ChevronDown size={14} className={`user-chevron ${showUserMenu ? "open" : ""}`} />
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <span className="user-dropdown-email">{user.email}</span>
                    </div>
                    <div className="user-dropdown-divider" />
                    <button
                      className="user-dropdown-item"
                      onClick={() => { navigate("/favoritos"); setShowUserMenu(false); }}
                    >
                      <Heart size={15} />
                      Mis favoritos
                      {favorites.size > 0 && (
                        <span className="user-dropdown-badge">{favorites.size}</span>
                      )}
                    </button>
                    <button
                      className="user-dropdown-item"
                      onClick={() => { setShowOrdersDrawer(true); setShowUserMenu(false); }}
                    >
                      <Package size={15} /> Mis pedidos
                    </button>
                    <div className="user-dropdown-divider" />
                    <button
                      className="user-dropdown-item user-dropdown-item--danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-btn" onClick={() => setShowAuthModal(true)}>
                <LogIn size={16} />
                <span>Ingresar</span>
              </button>
            )}

            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={22} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              <span className="cart-label">Mi pedido</span>
            </button>
          </div>
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <OrdersDrawer isOpen={showOrdersDrawer} onClose={() => setShowOrdersDrawer(false)} />
    </>
  );
}
