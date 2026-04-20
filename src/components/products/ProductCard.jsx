// components/products/ProductCard.jsx
import { useState, useEffect, useRef } from "react";
import { Plus, Minus, ShoppingCart, Check, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const PLACEHOLDER = "https://placehold.co/400x400?text=Sin+imagen";
const SLIDE_INTERVAL = 6000;
const ANIM_MS = 420;

export default function ProductCard({ product, onNeedLogin, style }) {
  const { addToCart } = useCart();
  const { favorites, toggleFavorite, isLoggedIn } = useAuth();

  const [qty, setQty]         = useState(1);
  const [added, setAdded]     = useState(false);
  const [favAnim, setFavAnim] = useState(false);

  // Carousel state
  const [displayed, setDisplayed]   = useState(0);   // index currently shown
  const [outgoing, setOutgoing]     = useState(null); // { idx, dir } | null
  const animating   = useRef(false);
  const displayedRef = useRef(0);
  const timerRef    = useRef(null);
  const qtyRef      = useRef(null);

  const isFav = favorites.has(product.id);

  const images = (() => {
    const raw  = product.images ?? (product.image ? [product.image] : []);
    const urls = raw.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
    return urls.length > 0 ? urls : [PLACEHOLDER];
  })();

  const total = images.length;

  const goTo = (nextIdx, dir = "next") => {
    if (animating.current || nextIdx === displayedRef.current) return;
    animating.current = true;
    setOutgoing({ idx: displayedRef.current, dir });
    displayedRef.current = nextIdx;
    setDisplayed(nextIdx);
    setTimeout(() => {
      setOutgoing(null);
      animating.current = false;
    }, ANIM_MS);
  };

  const restartTimer = () => {
    clearInterval(timerRef.current);
    if (total > 1) {
      timerRef.current = setInterval(() => {
        if (!animating.current) {
          goTo((displayedRef.current + 1) % total, "next");
        }
      }, SLIDE_INTERVAL);
    }
  };

  useEffect(() => {
    restartTimer();
    return () => clearInterval(timerRef.current);
  }, [total]);

  const prev = (e) => {
    e.stopPropagation();
    restartTimer();
    goTo((displayedRef.current - 1 + total) % total, "prev");
  };
  const next = (e) => {
    e.stopPropagation();
    restartTimer();
    goTo((displayedRef.current + 1) % total, "next");
  };

  useEffect(() => {
    if (qtyRef.current && document.activeElement !== qtyRef.current) {
      qtyRef.current.textContent = String(qty);
    }
  }, [qty]);

  const handleDecrement = () => setQty((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQty((q) => q + 1);

  const commitQty = () => {
    const n = parseInt(qtyRef.current?.textContent ?? "", 10);
    const clamped = isNaN(n) || n < 1 ? 1 : n;
    setQty(clamped);
    if (qtyRef.current) qtyRef.current.textContent = String(clamped);
  };

  const handleQtyKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); qtyRef.current?.blur(); }
    if (e.key === "Escape") {
      if (qtyRef.current) qtyRef.current.textContent = String(qty);
      qtyRef.current?.blur();
    }
    if (!e.key.match(/^[0-9]$/) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setQty(1);
  };

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { onNeedLogin?.(); return; }
    setFavAnim(true);
    await toggleFavorite(product.id);
    setTimeout(() => setFavAnim(false), 400);
  };

  return (
    <div className="product-card" style={style}>
      <div className="product-img-wrap">

        {/* Imagen saliente (se va) */}
        {outgoing !== null && (
          <img
            src={images[outgoing.idx]}
            alt={product.name}
            className={`product-img slide-exit-${outgoing.dir}`}
            onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
          />
        )}

        {/* Imagen actual (entra o está quieta) */}
        <img
          src={images[displayed]}
          alt={product.name}
          className={`product-img${outgoing ? ` slide-enter-${outgoing.dir}` : ""}`}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />

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
                    goTo(i, i > displayedRef.current ? "next" : "prev");
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
              <button className="qty-btn" onClick={handleDecrement} disabled={qty <= 1}>
                <Minus size={14} />
              </button>

              <span
                ref={qtyRef}
                className="qty-value"
                contentEditable
                suppressContentEditableWarning
                onBlur={commitQty}
                onKeyDown={handleQtyKeyDown}
                onFocus={(e) => {
                  const range = document.createRange();
                  range.selectNodeContents(e.currentTarget);
                  const sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range);
                }}
              >
                {qty}
              </span>

              <button className="qty-btn" onClick={handleIncrement}>
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
