"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../../contexts/CartContext";
import GlobalNavbar from "../../../components/layout/GlobalNavbar";

interface Store {
  id: string;
  storeName: string;
  description: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  userId: string;
  createdAt: any;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category: string;
  storeId: string;
}

export default function StorePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    fetchStoreAndProducts();
  }, [storeId]);

  const fetchStoreAndProducts = async () => {
    try {
      setLoading(true);

      // Mağaza bilgilerini getir
      const storeDoc = await getDoc(doc(db, "storeSettings", storeId));

      if (storeDoc.exists()) {
        setStore({ id: storeDoc.id, ...storeDoc.data() } as Store);
      } else {
        setError("Mağaza bulunamadı");
        return;
      }

      // Mağazaya ait ürünleri getir
      const productsQuery = query(
        collection(db, "products"),
        where("storeId", "==", storeId)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Product)
      );

      setProducts(productsData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
      setError("Veriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      storeId: product.storeId,
    });
    setMessage(`"${product.name}" sepete eklendi!`);
    setTimeout(() => setMessage(""), 3000);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Link
            href="/store"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Mağazalara Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavbar />

      {/* Başarı mesajı */}
      {message && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      {/* Mağaza Header */}
      {store && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {store.logo ? (
                  <Image
                    src={store.logo}
                    alt={store.storeName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-500">
                      {store.storeName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {store.storeName}
                </h1>
                {store.description && (
                  <p className="text-gray-600 mb-2">{store.description}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
                  {store.address && (
                    <div className="flex items-center">
                      <span>📍 {store.address}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-center">
                      <span>📞 {store.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Arama Barı */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Ürünler */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Ürün bulunamadı" : "Henüz ürün yok"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Arama kriterlerinize uygun ürün bulunamadı."
                : "Bu mağazada henüz ürün bulunmuyor."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Ürünler ({filteredProducts.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            Stokta Yok
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        ₺{product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stok: {product.stock}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.stock <= 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                      }`}
                    >
                      {product.stock <= 0 ? "Stokta Yok" : "Sepete Ekle"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
