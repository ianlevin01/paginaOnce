// pages/ShopPage.jsx
import { useState, useEffect, useRef } from "react";
import { ChevronUp } from "lucide-react";
import FilterBar from "../components/products/FilterBar";
import ProductGrid from "../components/products/ProductGrid";
import AuthModal from "../components/auth/AuthModal";

const API_URL    = import.meta.env.VITE_API_URL ?? "https://gestionmayorista.online";
const NEGOCIO_ID = "00000000-0000-0000-0000-000000000001";
const PAGE_SIZE  = 60;
const MAX_PRICE  = 50000;


export default function ShopPage() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [offset, setOffset]       = useState(0);
  const [hasMore, setHasMore]     = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const contentRef  = useRef(null);
  const sentinelRef = useRef(null);
  const restoredRef = useRef(false);

  // { id, name }[]
  const [categories, setCategories] = useState([]);

  const initialSearch = new URLSearchParams(window.location.search).get("buscar") ?? "";

  const [filters, setFilters] = useState({
    search:     initialSearch,
    categoryId: null,
    maxPrice:   MAX_PRICE,
    sort:       "default",
  });

  // Scroll top button + guardar posición en sessionStorage
  useEffect(() => {
    let saveTimer;
    const onScroll = () => {
      setShowScrollBtn(window.scrollY > 300);
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => sessionStorage.setItem("shopScrollY", String(window.scrollY)), 250);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(saveTimer); };
  }, []);

  // Restaurar posición después de que los productos del primer batch se pinten
  useEffect(() => {
    if (restoredRef.current || loading || products.length === 0) return;
    const saved = Number(sessionStorage.getItem("shopScrollY") ?? 0);
    if (saved < 100) return;
    restoredRef.current = true;
    // doble rAF: espera a que el navegador pinte el DOM antes de hacer scroll
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo({ top: saved, behavior: "instant" });
    }));
  }, [loading, products.length]);

  // ── Cargar categorías ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/products/categories?negocio_id=${NEGOCIO_ID}`)
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

  // ── Debounce precio (evitar requests en cada tick del slider) ─────────────
  const maxPriceTimer = useRef(null);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(filters.maxPrice);

  useEffect(() => {
    clearTimeout(maxPriceTimer.current);
    maxPriceTimer.current = setTimeout(() => {
      setDebouncedMaxPrice(filters.maxPrice);
    }, 400);
    return () => clearTimeout(maxPriceTimer.current);
  }, [filters.maxPrice]);

  // ── Reset al cambiar categoría, búsqueda, orden o precio ─────────────────
  const prevCatRef      = useRef(filters.categoryId);
  const prevSearchRef   = useRef(debouncedSearch);
  const prevSortRef     = useRef(filters.sort);
  const prevMaxPriceRef = useRef(debouncedMaxPrice);

  useEffect(() => {
    const catChanged      = filters.categoryId !== prevCatRef.current;
    const searchChanged   = debouncedSearch    !== prevSearchRef.current;
    const sortChanged     = filters.sort       !== prevSortRef.current;
    const maxPriceChanged = debouncedMaxPrice  !== prevMaxPriceRef.current;
    prevCatRef.current      = filters.categoryId;
    prevSearchRef.current   = debouncedSearch;
    prevSortRef.current     = filters.sort;
    prevMaxPriceRef.current = debouncedMaxPrice;

    if (catChanged || searchChanged || sortChanged || maxPriceChanged) {
      setOffset(0);
      setProducts([]);
    }
  }, [filters.categoryId, debouncedSearch, filters.sort, debouncedMaxPrice]);

  // ── Fetch principal ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    let url;
    if (debouncedSearch) {
      url = `${API_URL}/api/products/search?name=${encodeURIComponent(debouncedSearch)}&negocio_id=${NEGOCIO_ID}`;
    } else {
      const params = new URLSearchParams({ limit: PAGE_SIZE, offset, negocio_id: NEGOCIO_ID });
      if (filters.categoryId) params.set("category_id", filters.categoryId);
      if (filters.sort && filters.sort !== "default") params.set("sort", filters.sort);
      if (debouncedMaxPrice < MAX_PRICE) params.set("max_price", debouncedMaxPrice);
      url = `${API_URL}/api/products?${params}`;
    }

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar productos");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const normalized = data.map(normalizeProduct).filter((p) => p.active !== false);
        if (debouncedSearch) {
          setProducts(normalized);
          setHasMore(false);
        } else {
          setProducts((prev) => offset === 0 ? normalized : [...prev, ...normalized]);
          setHasMore(data.length === PAGE_SIZE);
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedSearch, filters.categoryId, filters.sort, debouncedMaxPrice, offset]);

  // Infinite scroll: observa el sentinel al final del listado
  // (va después de todas las declaraciones de estado para poder referenciar debouncedSearch)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && !debouncedSearch) {
          setOffset((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: "400px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [hasMore, loading, debouncedSearch]);

  return (
    <main className="shop-main">
      <div className="shop-hero">
        <img src="/banner.png" alt="Oncepuntos" className="hero-banner" />
      </div>

      <div className="shop-content" ref={contentRef}>
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
            <span>{products.length} productos encontrados</span>
          )}
        </div>

        <ProductGrid
          products={products}
          loading={loading && products.length === 0}
          onNeedLogin={() => setShowAuthModal(true)}
        />

        {/* Sentinel para infinite scroll */}
        {!debouncedSearch && <div ref={sentinelRef} style={{ height: 1 }} />}

        {loading && products.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "1.5rem", opacity: 0.5, fontSize: 14 }}>
            Cargando más productos...
          </div>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showScrollBtn && (
        <button
          className="scroll-top-btn"
          onClick={() => contentRef.current?.scrollIntoView({ behavior: "smooth" })}
          aria-label="Volver al inicio de productos"
        >
          <ChevronUp size={26} strokeWidth={2.5} />
        </button>
      )}
    </main>
  );
}

function normalizeProduct(p) {
  const prices  = p.prices ?? [];
  const tier    = import.meta.env.VITE_PRICE_TIER || "1";
  const price1  = prices.find((x) => x.price_type === `precio_${tier}`);
  const price   = parseFloat(price1?.price ?? prices[0]?.price ?? 0);
  const stockArr = p.stock ?? [];
  const stock   = stockArr.length === 0
    ? 99
    : stockArr.reduce((acc, s) => acc + (s.quantity ?? 0), 0);

  return {
    id:          p.id,
    code:        p.code ?? "",
    name:        p.name,
    description: p.description ?? "",
    category:    p.category_name ?? "",
    images:      p.images ?? [],
    image:       p.images?.[0]?.url ?? null,
    price,
    stock,
    active: p.active ?? true,
  };
}
