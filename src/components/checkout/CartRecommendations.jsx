import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";

const API_URL    = import.meta.env.VITE_API_URL ?? "https://gestionmayorista.online";
const NEGOCIO_ID = "00000000-0000-0000-0000-000000000001";
const PLACEHOLDER = "https://placehold.co/400x400?text=Sin+imagen";
const SESSION_KEY = "reco_dismissed_ids";

function getSessionIds() {
  try { return sessionStorage.getItem(SESSION_KEY) ?? ""; } catch { return ""; }
}
function setSessionIds(ids) {
  try { sessionStorage.setItem(SESSION_KEY, [...ids].sort().join(",")); } catch {}
}

function normalizeProduct(p) {
  const prices = p.prices ?? [];
  const price1 = prices.find((x) => x.price_type === "precio_1");
  const price  = parseFloat(price1?.price ?? prices[0]?.price ?? 0);
  return { ...p, price, image: p.images?.[0]?.url ?? null };
}

function RecoCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="reco-card">
      <img
        src={product.image ?? PLACEHOLDER}
        alt={product.name}
        className="reco-card-img"
        onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
      />
      <div className="reco-card-body">
        <p className="reco-card-name">{product.name}</p>
        <span className="reco-card-price">
          {product.price > 0 ? `$${product.price.toLocaleString("es-AR")}` : "Consultar"}
        </span>
        <button className={`reco-card-btn${added ? " added" : ""}`} onClick={handleAdd}>
          {added
            ? <><Check size={12} /> ¡Agregado!</>
            : <><ShoppingCart size={12} /> Agregar</>
          }
        </button>
      </div>
    </div>
  );
}

export default function CartRecommendations({ cartItems }) {
  const [products, setProducts] = useState([]);
  const [visible,  setVisible]  = useState(false);

  const [initialIds] = useState(() => cartItems.map((i) => i.id));

  useEffect(() => {
    if (initialIds.length === 0) return;
    // No mostrar si ya fue cerrado con exactamente este mismo carrito
    const currentKey = [...initialIds].sort().join(",");
    if (getSessionIds() === currentKey) return;

    const ids = initialIds.join(",");
    fetch(`${API_URL}/api/products/cart-recommendations?product_ids=${encodeURIComponent(ids)}&negocio_id=${NEGOCIO_ID}&limit=8`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const normalized = data.map(normalizeProduct);
        if (normalized.length > 0) {
          setProducts(normalized);
          setTimeout(() => setVisible(true), 1200);
        }
      })
      .catch(() => {});
  }, [initialIds]);

  const dismiss = () => {
    setVisible(false);
    setSessionIds(initialIds);
  };

  if (!visible || products.length === 0) return null;

  return (
    <div className="reco-sheet">
      <div className="reco-sheet-header">
        <span className="reco-sheet-title">También te puede interesar</span>
        <button className="reco-sheet-close" onClick={dismiss} aria-label="Cerrar">✕</button>
      </div>
      <div className="reco-scroll">
        {products.map((p) => <RecoCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
