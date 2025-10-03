import Link from "next/link";
import { Store } from "./types";

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {(store.displayName || store.email).charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {store.displayName || "Mağaza"}
          </h3>
          <p className="text-sm text-gray-500">{store.email}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <strong>{store.products.length}</strong> ürün •
          <strong>
            {" "}
            {store.products.reduce((sum, p) => sum + p.stock, 0)}
          </strong>{" "}
          toplam stok
        </p>

        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Popüler ürünler:</p>
          <div className="flex flex-wrap gap-1">
            {store.products.slice(0, 3).map((product) => (
              <span
                key={product.id}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {product.name.length > 15
                  ? product.name.substring(0, 15) + "..."
                  : product.name}
              </span>
            ))}
            {store.products.length > 3 && (
              <span className="text-xs text-gray-400">
                +{store.products.length - 3} daha
              </span>
            )}
          </div>
        </div>
      </div>

      <Link
        href={`/store/${store.userId}`}
        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Mağazayı Ziyaret Et
      </Link>
    </div>
  );
}
