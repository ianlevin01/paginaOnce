import { useState } from "react";
import { Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";

const PLACEHOLDER = "https://placehold.co/400x400?text=Sin+imagen";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [qty, setQty]     = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setQty(1);
  };

  const sinStock = product.stock <= 0;

  return (
    <div className={`product-card ${sinStock ? "out-of-stock" : ""}`}>
      <div className="product-img-wrap">
        <img
          src={product.image ?? PLACEHOLDER}
          alt={product.name}
          className="product-img"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />
        {product.category && (
          <span className="product-category">{product.category}</span>
        )}
        {sinStock && (
          <span className="product-badge-out">Sin stock</span>
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}

        <div className="product-footer">
          <span className="product-price">
            {product.price > 0
              ? `$${product.price.toLocaleString("es-AR")}`
              : "Consultar"}
          </span>

          <div className="product-actions">
            <div className="qty-control">
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={sinStock}
              >
                <Minus size={14} />
              </button>
              <span className="qty-value">{qty}</span>
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                disabled={sinStock}
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              className={`add-btn ${added ? "added" : ""}`}
              onClick={handleAdd}
              disabled={sinStock}
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
