import { ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-mark">●</span>
          <span className="logo-text">MERCADO<strong>LOCAL</strong></span>
        </div>
        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
          <ShoppingBag size={22} />
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          <span className="cart-label">Mi pedido</span>
        </button>
      </div>
    </header>
  );
}
