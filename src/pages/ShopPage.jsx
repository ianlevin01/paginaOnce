// pages/ShopPage.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import FilterBar from "../components/products/FilterBar.jsx";
import ProductGrid from "../components/products/ProductGrid.jsx";
import AuthModal from "../components/auth/AuthModal.jsx.jsx";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const PAGE_SIZE = 60;
const MAX_PRICE = 50000;

// ── Función de ordenamiento local ─────────────────────────────────────────────
function sortProducts(products, sort) {
  if (!sort || sort === "default") return products;
  const arr = [...products];
  switch (sort) {
    case "price_asc":  return arr.sort((a, b) => a.price - b.price);
    case "price_desc": return arr.sort((a, b) => b.price - a.price);
    case "name_asc":   return arr.sort((a, b) => a.name.localeCompare(b.name, "es"));
    case "name_desc":  return arr.sort((a, b) => b.name.localeCompare(a.name, "es"));
    default:           return arr;
  }
}

export default function ShopPage() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [offset, setOffset]       = useState(0);
  const [hasMore, setHasMore]     = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // { id, name }[]
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    search:     "",
    categoryId: null,
    maxPrice:   MAX_PRICE,
    sort:       "default",
  });

  // ── Cargar categorías ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/products/categories`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setCategories)
      .catch(() => {});
  }, []);

  // ── Debounce búsqueda ─────────────────────────────────────────────────────
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [filters.search]);

  // ── Reset al cambiar categoría o búsqueda ────────────────────────────────
  const prevCatRef    = useRef(filters.categoryId);
  const prevSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    const catChanged    = filters.categoryId !== prevCatRef.current;
    const searchChanged = debouncedSearch    !== prevSearchRef.current;
    prevCatRef.current    = filters.categoryId;
    prevSearchRef.current = debouncedSearch;

    if (catChanged || searchChanged) {
      setOffset(0);
      setProducts([]);
    }
  }, [filters.categoryId, debouncedSearch]);

  // ── Fetch principal ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    let url;
    if (debouncedSearch) {
      url = `${API_URL}/api/products/search?name=${encodeURIComponent(debouncedSearch)}`;
    } else {
      const params = new URLSearchParams({ limit: PAGE_SIZE, offset });
      if (filters.categoryId) params.set("category_id", filters.categoryId);
      url = `${API_URL}/api/products?${params}`;
    }

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar productos");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const normalized = data.map(normalizeProduct);
        if (debouncedSearch) {
          setProducts(normalized);
          setHasMore(false);
        } else {
          setProducts((prev) => offset === 0 ? normalized : [...prev, ...normalized]);
          setHasMore(normalized.length === PAGE_SIZE);
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedSearch, filters.categoryId, offset]);

  // ── Filtro local de precio + ordenamiento ─────────────────────────────────
  const filtered = useMemo(() => {
    let result = products;
    if (filters.maxPrice < MAX_PRICE) {
      result = result.filter((p) => p.price <= filters.maxPrice);
    }
    return sortProducts(result, filters.sort);
  }, [products, filters.maxPrice, filters.sort]);

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
          {loading && products.length === 0 ? (
            <span>Cargando productos...</span>
          ) : error ? (
            <span className="results-error">⚠ {error}</span>
          ) : (
            <span>{filtered.length} productos encontrados</span>
          )}
        </div>

        <ProductGrid
          products={filtered}
          loading={loading && products.length === 0}
          onNeedLogin={() => setShowAuthModal(true)}
        />

        {hasMore && !loading && !debouncedSearch && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              className="btn-load-more"
              onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
            >
              Cargar más productos
            </button>
          </div>
        )}

        {loading && products.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "1rem", opacity: 0.5 }}>
            Cargando más...
          </div>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </main>
  );
}

function normalizeProduct(p) {
  const prices  = p.prices ?? [];
  const price1  = prices.find((x) => x.price_type === "precio_1");
  const price   = parseFloat(price1?.price ?? prices[0]?.price ?? 0);
  const stockArr = p.stock ?? [];
  const stock   = stockArr.length === 0
    ? 99
    : stockArr.reduce((acc, s) => acc + (s.quantity ?? 0), 0);

  return {
    id:          p.id,
    name:        p.name,
    description: p.description ?? "",
    category:    p.category_name ?? "",
    images:      p.images ?? [],
    image:       p.images?.[0]?.url ?? null,
    price,
    stock,
  };
}
