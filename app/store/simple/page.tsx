"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  userId: string;
}

export default function SimpleStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log("🔍 Basit ürün yükleme başlıyor...");
      
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📦 Ürün bulundu:", { id: doc.id, name: data.name, stock: data.stock });
        
        productList.push({
          id: doc.id,
          name: data.name || 'İsimsiz Ürün',
          price: data.price || 0,
          stock: data.stock || 0,
          category: data.category || 'Genel',
          description: data.description,
          userId: data.userId
        });
      });

      console.log("✅ Toplam ürün:", productList.length);
      setProducts(productList);
      
    } catch (error) {
      console.error("❌ Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tüm Ürünler (Basit Görünüm)</h1>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Debug Info:</strong> Toplam {products.length} ürün bulundu. 
            Console'u kontrol edin (F12).
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hiç ürün bulunamadı</h3>
            <p className="text-gray-500 mb-4">
              Henüz hiç ürün eklenmemiş veya ürünlere erişim sorunu var.
            </p>
            <Link 
              href="/dashboard/products"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ürün Ekle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description || 'Açıklama yok'}</p>
                <p className="text-blue-600 font-bold text-xl mb-2">₺{product.price}</p>
                <p className="text-sm mb-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} stokta` : 'Stok yok'}
                  </span>
                </p>
                <Link
                  href={`/product/${product.id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Ürünü Görüntüle
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}