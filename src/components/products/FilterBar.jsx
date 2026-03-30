import { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronDown, Tag } from "lucide-react";

const MAX_PRICE = 50000;

// categories: [{ id, name }]
export default function FilterBar({ filters, setFilters, categories = [] }) {
  const [catOpen, setCatOpen] = useState(false);
  const dropdownRef           = useRef(null);

  const selectedName = filters.categoryId === null
    ? "Todas las categorías"
    : (categories.find((c) => c.id === filters.categoryId)?.name ?? "Categoría");

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCat = (id) => {
    setFilters((f) => ({ ...f, categoryId: id }));
    setCatOpen(false);
  };

  return (
    <div className="filterbar">
      <div className="filter-row">

        {/* ── Buscador ── */}
        <div className="search-wrap search-wrap--row">
          <Search size={18} className="search-icon" />
          <input
            className="search-input"
            placeholder="Buscar productos..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>

        {/* ── Dropdown categorías ── */}
        <div className="cat-dropdown" ref={dropdownRef}>
          <button
            className={`cat-trigger ${catOpen ? "open" : ""} ${filters.categoryId !== null ? "has-value" : ""}`}
            onClick={() => setCatOpen((o) => !o)}
          >
            <Tag size={15} />
            <span className="cat-trigger-label">{selectedName}</span>
            <ChevronDown size={15} className="cat-chevron" />
          </button>

          {catOpen && (
            <div className="cat-menu">
              <button
                className={`cat-option ${filters.categoryId === null ? "active" : ""}`}
                onClick={() => selectCat(null)}
              >
                Todas las categorías
              </button>
              <div className="cat-menu-divider" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`cat-option ${filters.categoryId === cat.id ? "active" : ""}`}
                  onClick={() => selectCat(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Precio ── */}
        <div className="price-filter">
          <SlidersHorizontal size={16} />
          <span className="price-label">
            {filters.maxPrice >= MAX_PRICE
              ? "Todos los precios"
              : `Hasta $${filters.maxPrice.toLocaleString("es-AR")}`}
          </span>
          <input
            type="range"
            min={500}
            max={MAX_PRICE}
            step={500}
            value={Math.min(filters.maxPrice, MAX_PRICE)}
            onChange={(e) => {
              const val = Number(e.target.value);
              setFilters((f) => ({ ...f, maxPrice: val >= MAX_PRICE ? Infinity : val }));
            }}
            className="price-range"
          />
        </div>

      </div>
    </div>
  );
}
