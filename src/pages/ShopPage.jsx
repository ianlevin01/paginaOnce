import { useState, useEffect, useMemo, useRef } from "react";
import FilterBar from "../components/products/FilterBar";
import ProductGrid from "../components/products/ProductGrid";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const PAGE_SIZE = 60;
const MAX_PRICE = 50000;

export default function ShopPage() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [offset, setOffset]       = useState(0);
  const [hasMore, setHasMore]     = useState(true);

  // { id, name }[]  — se carga una sola vez al montar
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    search:     "",
    categoryId: null,   // null = "Todos"
    maxPrice:   MAX_PRICE,
  });

  // ── Cargar categorías al montar ───────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/products/categories`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setCategories)
      .catch(() => {}); // no bloquea la app si falla
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

  // ── Filtro local de precio ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (filters.maxPrice >= MAX_PRICE) return products;
    return products.filter((p) => p.price <= filters.maxPrice);
  }, [products, filters.maxPrice]);

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

        <ProductGrid products={filtered} loading={loading && products.length === 0} />

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
    </main>
  );
}

function normalizeProduct(p) {
  const prices = p.prices ?? [];
  const price1 = prices.find((x) => x.price_type === "precio_1");
  const price  = parseFloat(price1?.price ?? prices[0]?.price ?? 0);
  const stockArr = p.stock ?? [];
  const stock = stockArr.length === 0
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


