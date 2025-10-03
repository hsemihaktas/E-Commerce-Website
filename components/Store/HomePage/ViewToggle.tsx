import { ViewType, Product, Store } from "./types";

interface ViewToggleProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  products: Product[];
  stores: Store[];
}

export default function ViewToggle({
  view,
  setView,
  products,
  stores,
}: ViewToggleProps) {
  return (
    <div className="mb-6 flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
      <button
        onClick={() => setView("products")}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          view === "products"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Ürünler ({products.length})
      </button>
      <button
        onClick={() => setView("stores")}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          view === "stores"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Mağazalar ({stores.length})
      </button>
    </div>
  );
}
