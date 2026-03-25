import { useState, useEffect, useMemo, useRef } from "react";
import FilterBar from "../components/products/FilterBar";
import ProductGrid from "../components/products/ProductGrid";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const PAGE_SIZE = 60;
const MAX_PRICE = 50000;

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [offset, setOffset]           = useState(0);
  const [hasMore, setHasMore]         = useState(true);

  const [filters, setFilters] = useState({
    search:   "",
    category: "Todos",
    maxPrice: MAX_PRICE,
  });

  // Debounce para la búsqueda — evita un fetch por cada tecla
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [filters.search]);

  // ── Fetch por búsqueda ────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedSearch) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/products/search?name=${encodeURIComponent(debouncedSearch)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar productos");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setAllProducts(data.map(normalizeProduct));
        setHasMore(false);
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedSearch]);

  // ── Fetch paginado (solo cuando no hay búsqueda activa) ───────────────────
  useEffect(() => {
    if (debouncedSearch) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/products?limit=${PAGE_SIZE}&offset=${offset}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar productos");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const normalized = data.map(normalizeProduct);
        setAllProducts((prev) => offset === 0 ? normalized : [...prev, ...normalized]);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedSearch, offset]);

  // Cuando se borra la búsqueda, volver al paginado desde 0
  useEffect(() => {
    if (!debouncedSearch) setOffset(0);
  }, [debouncedSearch]);

  // ── Filtros locales — no disparan re-fetch ni re-montan ProductCard ────────
  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const matchCat   = filters.category === "Todos" || p.category === filters.category;
      const matchPrice = p.price <= filters.maxPrice;
      return matchCat && matchPrice;
    });
  }, [allProducts, filters.category, filters.maxPrice]);

  // ── Categorías dinámicas ──────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map((p) => p.category).filter(Boolean))];
    return ["Todos", ...cats.sort()];
  }, [allProducts]);

  return (
    <main className="shop-main">
      <div className="shop-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Bienvenido a</p>
          <h1 className="hero-title">Oncepuntos</h1>
          <p className="hero-subtitle">Los mejores productos, directo a tu puerta</p>
        </div>
        <div className="hero-blob" />
      </div>

      <div className="shop-content">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          maxPrice={MAX_PRICE}
        />

        <div className="results-info">
          {loading && allProducts.length === 0 ? (
            <span>Cargando productos...</span>
          ) : error ? (
            <span className="results-error">⚠ {error}</span>
          ) : (
            <span>{filtered.length} productos encontrados</span>
          )}
        </div>

        <ProductGrid products={filtered} loading={loading && allProducts.length === 0} />

        {hasMore && !loading && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              className="btn-load-more"
              onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
            >
              Cargar más productos
            </button>
          </div>
        )}

        {loading && allProducts.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "1rem", opacity: 0.5 }}>
            Cargando más...
          </div>
        )}
      </div>
    </main>
  );
}

// ── Normaliza producto de la API al shape que usa ProductCard ─────────────────
function normalizeProduct(p) {
  const prices = p.prices ?? [];
  const price1 = prices.find((x) => x.price_type === "precio_1");
  const price  = parseFloat(price1?.price ?? prices[0]?.price ?? 0);
  const image  = p.images?.[0]?.url ?? null;
  const stockArr = p.stock ?? [];
const stock = stockArr.length === 0 
  ? 99  // sin info de stock → asumir disponible
  : stockArr.reduce((acc, s) => acc + (s.quantity ?? 0), 0);

  return {
    id:          p.id,
    name:        p.name,
    description: p.description ?? "",
    category:    p.category_name ?? "",
    image,
    price,
    stock,
  };
}
