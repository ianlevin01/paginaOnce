import ProductCard from "./ProductCard";
import { PackageSearch } from "lucide-react";

export default function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <PackageSearch size={48} strokeWidth={1} />
        <p>No se encontraron productos con esos filtros.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
