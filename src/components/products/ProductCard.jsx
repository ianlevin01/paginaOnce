import { useState, useEffect, useRef } from "react";
import { Plus, Minus, ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "../../context/CartContext";

const PLACEHOLDER = "https://placehold.co/400x400?text=Sin+imagen";
const SLIDE_INTERVAL = 6000; // 6 segundos entre slides

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [qty, setQty]             = useState(1);
  const [added, setAdded]         = useState(false);
  const [imgIndex, setImgIndex]   = useState(0);
  // direction: "next" | "prev" — para saber hacia dónde animar
  const [direction, setDirection] = useState("next");
  // "idle" | "exit" | "enter"
  const [phase, setPhase]         = useState("idle");
  const [displayed, setDisplayed] = useState(0); // índice que se ve en pantalla
  const timerRef                  = useRef(null);
  const animating                 = useRef(false);

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
    setImgIndex(nextIdx);  // precarga la imagen destino
    setPhase("exit");

    // Cuando termina el exit, cambia el displayed y empieza el enter
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
            return d; // no cambia todavía, lo cambia el setTimeout
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
  };

  const sinStock = product.stock <= 0;

  // Clase CSS según fase y dirección
  const imgClass = [
    "product-img",
    phase === "exit"  ? `slide-exit-${direction}`  : "",
    phase === "enter" ? `slide-enter-${direction}` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={`product-card ${sinStock ? "out-of-stock" : ""}`}>
      <div className="product-img-wrap">
        <img
          key={displayed}
          src={images[displayed]}
          alt={product.name}
          className={imgClass}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />

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
        {sinStock          && <span className="product-badge-out">Sin stock</span>}
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
              <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={sinStock}>
                <Minus size={14} />
              </button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} disabled={sinStock}>
                <Plus size={14} />
              </button>
            </div>

            <button className={`add-btn ${added ? "added" : ""}`} onClick={handleAdd} disabled={sinStock}>
              {added ? <Check size={16} /> : <ShoppingCart size={16} />}
              {added ? "¡Listo!" : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
