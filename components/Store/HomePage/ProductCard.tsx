import Link from "next/link";
import { Product } from "./types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-blue-300"
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
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {product.category || "Genel"}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 10
                ? "bg-green-100 text-green-800"
                : product.stock > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.stock > 0 ? `${product.stock} stok` : "Stok yok"}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || "Ürün açıklaması bulunmuyor"}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-blue-600">
            ₺{product.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            {product.storeOwner?.displayName || product.storeOwner?.email}
          </span>
        </div>

        <div className="space-y-2">
          <Link
            href={`/product/${product.id}`}
            className="block w-full text-center py-2 px-4 rounded-md font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
          >
            📖 Ürünü Görüntüle
          </Link>
          <button
            onClick={() => {
              console.log("🛒 Sepete ekleme:", product.name);
              onAddToCart(product);
            }}
            disabled={product.stock <= 0}
            className={`block w-full text-center py-2 px-4 rounded-md font-medium transition-colors ${
              product.stock > 0
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {product.stock > 0 ? "🛒 Sepete Ekle" : "❌ Stok Yok"}
          </button>
        </div>
      </div>
    </div>
  );
}
