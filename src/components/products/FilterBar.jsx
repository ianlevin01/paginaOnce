import { Search, SlidersHorizontal } from "lucide-react";

const MAX_PRICE = 50000;

export default function FilterBar({ filters, setFilters, categories = ["Todos"] }) {
  return (
    <div className="filterbar">
      <div className="search-wrap">
        <Search size={18} className="search-icon" />
        <input
          className="search-input"
          placeholder="Buscar productos..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
      </div>

      <div className="filter-row">
        <div className="categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${filters.category === cat ? "active" : ""}`}
              onClick={() => setFilters((f) => ({ ...f, category: cat }))}
            >
              {cat}
            </button>
          ))}
        </div>

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
              setFilters((f) => ({
                ...f,
                maxPrice: val >= MAX_PRICE ? Infinity : val,
              }));
            }}
            className="price-range"
          />
        </div>
      </div>
    </div>
  );
}
