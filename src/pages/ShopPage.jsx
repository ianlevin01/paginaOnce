import { useState, useMemo } from "react";
import FilterBar from "../components/products/FilterBar";
import ProductGrid from "../components/products/ProductGrid";
import { products } from "../data/mockProducts";

export default function ShopPage() {
  const [filters, setFilters] = useState({
    search: "",
    category: "Todos",
    maxPrice: 50000,
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchCat = filters.category === "Todos" || p.category === filters.category;
      const matchPrice = p.price <= filters.maxPrice;
      return matchSearch && matchCat && matchPrice;
    });
  }, [filters]);

  return (
    <main className="shop-main">
      <div className="shop-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Bienvenido a</p>
          <h1 className="hero-title">MercadoLocal</h1>
          <p className="hero-subtitle">Los mejores productos, directo a tu puerta</p>
        </div>
        <div className="hero-blob" />
      </div>
      <div className="shop-content">
        <FilterBar filters={filters} setFilters={setFilters} />
        <div className="results-info">
          <span>{filtered.length} productos encontrados</span>
        </div>
        <ProductGrid products={filtered} />
      </div>
    </main>
  );
}
