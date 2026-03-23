import { Search, SlidersHorizontal } from "lucide-react";
import { categories } from "../../data/mockProducts";

export default function FilterBar({ filters, setFilters }) {
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
          <span className="price-label">Hasta ${filters.maxPrice.toLocaleString()}</span>
          <input
            type="range"
            min={500}
            max={50000}
            step={500}
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))
            }
            className="price-range"
          />
        </div>
      </div>
    </div>
  );
}
