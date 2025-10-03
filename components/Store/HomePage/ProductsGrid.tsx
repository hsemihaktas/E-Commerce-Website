import { Product } from "./types";
import ProductCard from "./ProductCard";

interface ProductsGridProps {
  filteredProducts: Product[];
  searchTerm: string;
  selectedCategory: string;
  onAddToCart: (product: Product) => void;
}

export default function ProductsGrid({
  filteredProducts,
  searchTerm,
  selectedCategory,
  onAddToCart,
}: ProductsGridProps) {
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Ürün bulunamadı
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm || selectedCategory !== "all"
            ? "Arama kriterlerinize uygun ürün bulunamadı."
            : "Henüz hiç ürün eklenmemiş."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
