"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../../contexts/CartContext";
import { Product, Store, ViewType } from "./types";
import { loadAllProducts } from "./dataService";
import StoreHeader from "./StoreHeader";
import ViewToggle from "./ViewToggle";
import ProductFilters from "./ProductFilters";
import ProductsGrid from "./ProductsGrid";
import StoresGrid from "./StoresGrid";
import LoadingSpinner from "./LoadingSpinner";

export default function StoreHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>("products");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      storeId: product.storeId,
      userId: product.userId, // Geriye dönük uyumluluk
    });
    setMessage(`"${product.name}" sepete eklendi!`);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await loadAllProducts();
      const productsWithStore = result.products;
      const allStoreSettings = result.allStores;

      setProducts(productsWithStore);

      // Önce ürünü olan mağazaları grupla
      const storesMap = new Map<string, Store>();
      productsWithStore.forEach((product) => {
        const storeId = product.storeId;

        if (!storesMap.has(storeId)) {
          const store = {
            userId: product.userId || storeId, // Geriye dönük uyumluluk
            email: product.storeOwner?.email || "Bilinmiyor",
            displayName: product.storeOwner?.displayName,
            storeName: product.storeSettings?.storeName || product.storeName,
            storeDescription: product.storeSettings?.description,
            products: [],
          };

          storesMap.set(storeId, store);
        }
        storesMap.get(storeId)?.products.push(product);
      }); // Şimdi ürünü olmayan ama mağaza kurmuş kişileri de ekle
      allStoreSettings.forEach((storeData, storeId) => {
        if (
          !storesMap.has(storeId) &&
          storeData.storeName &&
          storeData.storeName !== "Mağazam"
        ) {
          const store = {
            userId: storeData.userId || storeId,
            email: storeData.contactInfo?.email || "Bilinmiyor",
            displayName: storeData.contactInfo?.email?.split("@")[0],
            storeName: storeData.storeName,
            storeDescription: storeData.description,
            products: [],
          };

          storesMap.set(storeId, store);
        }
      });

      const storesList = Array.from(storesMap.values());
      setStores(storesList);
    } catch (error) {
      console.error("❌ Ürünler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kategorileri çıkar
  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Filtreleme
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StoreHeader message={message} />

        <ViewToggle
          view={view}
          setView={setView}
          products={products}
          stores={stores}
        />

        {view === "products" && (
          <>
            <ProductFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
            />

            <ProductsGrid
              filteredProducts={filteredProducts}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onAddToCart={handleAddToCart}
            />
          </>
        )}

        {view === "stores" && <StoresGrid stores={stores} />}
      </div>
    </div>
  );
}
