"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  imageUrl?: string;
  userId: string;
  createdAt?: any;
  // Mağaza sahibi bilgileri
  storeOwner?: {
    email: string;
    displayName?: string;
  };
}

interface Store {
  userId: string;
  email: string;
  displayName?: string;
  products: Product[];
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"products" | "stores">("products");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      console.log("🔍 Ürünler yükleniyor...");

      // Önce tüm ürünleri stok filtresi olmadan getir
      const allProductsQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );

      const allProductsSnapshot = await getDocs(allProductsQuery);
      console.log("📦 Toplam ürün sayısı:", allProductsSnapshot.size);
      
      const allProducts: Product[] = [];

      allProductsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📦 Ürün:", { id: doc.id, name: data.name, stock: data.stock, userId: data.userId });
        allProducts.push({
          id: doc.id,
          ...data,
        } as Product);
      });

      console.log("✅ Yüklenen ürünler:", allProducts.length);

      // Sadece stokta olan ürünleri filtrele (client-side)  
      const stockedProducts = allProducts.filter(product => (product.stock || 0) > 0);
      console.log("📦 Stokta olan ürünler:", stockedProducts.length);

      // Kullanıcı bilgilerini ekle (users collection'ını kontrol et)
      try {
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        console.log("👥 Users collection size:", usersSnapshot.size);
        
        const usersMap = new Map();
        usersSnapshot.forEach((doc) => {
          usersMap.set(doc.id, doc.data());
        });

        // Ürünlere mağaza sahibi bilgilerini ekle
        const productsWithStore = stockedProducts.map((product) => ({
          ...product,
          storeOwner: usersMap.get(product.userId) || { email: "Mağaza Sahibi" },
        }));

        setProducts(productsWithStore);

        // Mağazaları grupla
        const storesMap = new Map<string, Store>();
        productsWithStore.forEach((product) => {
          if (!storesMap.has(product.userId)) {
            storesMap.set(product.userId, {
              userId: product.userId,
              email: product.storeOwner?.email || "Bilinmiyor",
              displayName: product.storeOwner?.displayName,
              products: [],
            });
          }
          storesMap.get(product.userId)?.products.push(product);
        });

        setStores(Array.from(storesMap.values()));
        console.log("🏪 Mağaza sayısı:", storesMap.size);
        
      } catch (userError) {
        console.log("⚠️ Users collection bulunamadı, ürünleri yine de göster");
        // Users collection yoksa sadece ürünleri göster
        const productsWithStore = stockedProducts.map((product) => ({
          ...product,
          storeOwner: { email: "Mağaza Sahibi" },
        }));
        
        setProducts(productsWithStore);
        
        // Mağazaları grupla
        const storesMap = new Map<string, Store>();
        productsWithStore.forEach((product) => {
          if (!storesMap.has(product.userId)) {
            storesMap.set(product.userId, {
              userId: product.userId,
              email: 'Mağaza Sahibi',
              displayName: undefined,
              products: []
            });
          }
          storesMap.get(product.userId)?.products.push(product);
        });

        setStores(Array.from(storesMap.values()));
      }
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
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛍️ E-Ticaret Mağazası
          </h1>
          <p className="text-lg text-gray-600">
            Binlerce ürün, güvenilir satıcılar, tek platformda!
          </p>
        </div>

        {/* View Toggle */}
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

        {view === "products" && (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {categories
                    .filter((cat) => cat !== "all")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
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
                          {product.stock > 0
                            ? `${product.stock} stok`
                            : "Stok yok"}
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
                          {product.storeOwner?.displayName ||
                            product.storeOwner?.email}
                        </span>
                      </div>

                      <Link
                        href={`/product/${product.id}`}
                        className={`block w-full text-center py-2 px-4 rounded-md font-medium transition-colors ${
                          product.stock === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {product.stock === 0 ? "Stok Yok" : "Ürünü Görüntüle"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "stores" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.userId}
                className="bg-white rounded-lg shadow-md p-6"
              >
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
                    <p className="text-xs text-gray-500 mb-1">
                      Popüler ürünler:
                    </p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
