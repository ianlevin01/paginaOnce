// components/products/ProductCard.jsx
import { useState, useEffect, useRef } from "react";
import { Plus, Minus, ShoppingCart, Check, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const PLACEHOLDER = "https://placehold.co/400x400?text=Sin+imagen";
const SLIDE_INTERVAL = 6000;

export default function ProductCard({ product, onNeedLogin }) {
  const { addToCart } = useCart();
  const { favorites, toggleFavorite, isLoggedIn } = useAuth();

  const [qty, setQty]             = useState(1);
  const [qtyInput, setQtyInput]   = useState("1");
  const [added, setAdded]         = useState(false);
  const [imgIndex, setImgIndex]   = useState(0);
  const [direction, setDirection] = useState("next");
  const [phase, setPhase]         = useState("idle");
  const [displayed, setDisplayed] = useState(0);
  const [favAnim, setFavAnim]     = useState(false);
  const timerRef                  = useRef(null);
  const animating                 = useRef(false);

  const isFav = favorites.has(product.id);

  const images = (() => {
    const raw  = product.images ?? (product.image ? [product.image] : []);
    const urls = raw.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
    return urls.length > 0 ? urls : [PLACEHOLDER];
  })();

  const total = images.length;

  const goTo = (nextIdx, dir = "next") => {
    if (animating.current || nextIdx === displayed) return;
    animating.current = true;
    setDirection(dir);
    setImgIndex(nextIdx);
    setPhase("exit");
    setTimeout(() => {
      setDisplayed(nextIdx);
      setPhase("enter");
      setTimeout(() => {
        setPhase("idle");
        animating.current = false;
      }, 380);
    }, 350);
  };

  const prev = (e) => {
    e.stopPropagation();
    restartTimer();
    goTo((displayed - 1 + total) % total, "prev");
  };
  const next = (e) => {
    e.stopPropagation();
    restartTimer();
    goTo((displayed + 1) % total, "next");
  };

  const restartTimer = () => {
    clearInterval(timerRef.current);
    if (total > 1) {
      timerRef.current = setInterval(() => {
        if (!animating.current) {
          setDisplayed((d) => {
            const nextD = (d + 1) % total;
            setDirection("next");
            setImgIndex(nextD);
            setPhase("exit");
            animating.current = true;
            setTimeout(() => {
              setDisplayed(nextD);
              setPhase("enter");
              setTimeout(() => { setPhase("idle"); animating.current = false; }, 380);
            }, 350);
            return d;
          });
        }
      }, SLIDE_INTERVAL);
    }
  };

  useEffect(() => {
    restartTimer();
    return () => clearInterval(timerRef.current);
  }, [total]);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setQty(1);
    setQtyInput("1");
  };

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onNeedLogin?.();
      return;
    }
    setFavAnim(true);
    await toggleFavorite(product.id);
    setTimeout(() => setFavAnim(false), 400);
  };

  const imgClass = [
    "product-img",
    phase === "exit"  ? `slide-exit-${direction}`  : "",
    phase === "enter" ? `slide-enter-${direction}` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <img
          key={displayed}
          src={images[displayed]}
          alt={product.name}
          className={imgClass}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />

        {/* ── Botón favorito ── */}
        <button
          className={`fav-btn ${isFav ? "fav-btn--active" : ""} ${favAnim ? "fav-btn--pop" : ""}`}
          onClick={handleFav}
          aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart size={16} fill={isFav ? "currentColor" : "none"} />
        </button>

        {total > 1 && (
          <>
            <button className="slide-arrow slide-arrow--left" onClick={prev} aria-label="Anterior">
              <ChevronLeft size={16} />
            </button>
            <button className="slide-arrow slide-arrow--right" onClick={next} aria-label="Siguiente">
              <ChevronRight size={16} />
            </button>
            <div className="slide-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`slide-dot${i === displayed ? " active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    restartTimer();
                    goTo(i, i > displayed ? "next" : "prev");
                  }}
                  aria-label={`Imagen ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {product.category && <span className="product-category">{product.category}</span>}
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        {product.description && <p className="product-desc">{product.description}</p>}

        <div className="product-footer">
          <span className="product-price">
            {product.price > 0 ? `$${product.price.toLocaleString("es-AR")}` : "Consultar"}
          </span>

          <div className="product-actions">
            <div className="qty-control">
              <button
                className="qty-btn"
                onClick={() => {
                  const next = Math.max(1, qty - 1);
                  setQty(next);
                  setQtyInput(String(next));
                }}
              >
                <Minus size={14} />
              </button>
              <input
                className="qty-input"
                type="number"
                min={1}
                max={product.stock || 99}
                value={qtyInput}
                onChange={(e) => {
                  const raw = e.target.value;
                  setQtyInput(raw);
                  const n = parseInt(raw, 10);
                  if (!isNaN(n) && n >= 1) {
                    setQty(Math.min(n, product.stock || 99));
                  }
                }}
                onBlur={() => {
                  // Al perder el foco, normalizar al valor real
                  setQtyInput(String(qty));
                }}
              />
              <button
                className="qty-btn"
                onClick={() => {
                  const next = Math.min(product.stock || 99, qty + 1);
                  setQty(next);
                  setQtyInput(String(next));
                }}
              >
                <Plus size={14} />
              </button>
            </div>

            <button className={`add-btn ${added ? "added" : ""}`} onClick={handleAdd}>
              {added ? <Check size={16} /> : <ShoppingCart size={16} />}
              {added ? "¡Listo!" : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
