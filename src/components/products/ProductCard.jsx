import { useState } from "react";
import { Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setQty(1);
  };

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" />
        <span className="product-category">{product.category}</span>
      </div>
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toLocaleString()}</span>
          <div className="product-actions">
            <div className="qty-control">
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="qty-value">{qty}</span>
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              className={`add-btn ${added ? "added" : ""}`}
              onClick={handleAdd}
            >
              {added ? <Check size={16} /> : <ShoppingCart size={16} />}
              {added ? "¡Listo!" : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
