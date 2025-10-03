"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { getStoreSettings } from "../../services/storeService";

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  storeId?: string;
  storeName?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
  isEdit?: boolean;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
  isEdit = false,
}: ProductModalProps) {
  const { user } = useAuth();
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productStock, setProductStock] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && product) {
      setProductName(product.name);
      setProductDescription(product.description);
      setProductPrice(product.price.toString());
      setProductCategory(product.category);
      setProductStock(product.stock?.toString() || "0");
    } else {
      // Modal yeni ürün için açılıyorsa formu temizle
      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductCategory("");
      setProductStock("");
    }
  }, [isEdit, product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mağaza ayarlarını al ve kontrol et
      const storeSettings = await getStoreSettings(user!.uid);

      if (
        !storeSettings ||
        !storeSettings.storeName ||
        !storeSettings.description
      ) {
        alert("Önce mağaza ayarlarını tamamlamanız gerekmektedir!");
        return;
      }

      const productData = {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        category: productCategory,
        stock: parseInt(productStock) || 0,
        storeId: user?.uid, // Mağaza ID'si (storeSettings document ID'si ile aynı)
        storeName: storeSettings.storeName,
        updatedAt: new Date(),
      };
      if (isEdit && product?.id) {
        // Ürünü güncelle
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, productData);
      } else {
        // Yeni ürün ekle
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Ürün işlemi hatası:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {isEdit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Adı
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Açıklaması
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat (TL)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Kategori seçin</option>
                <option value="elektronik">Elektronik</option>
                <option value="giyim">Giyim</option>
                <option value="ev-yasam">Ev & Yaşam</option>
                <option value="spor">Spor</option>
                <option value="kitap">Kitap</option>
                <option value="oyuncak">Oyuncak</option>
                <option value="kozmetik">Kozmetik</option>
                <option value="diger">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok Adedi
              </label>
              <input
                type="number"
                min="0"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: 50"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 px-4 py-2 text-white rounded-md ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? "İşleniyor..." : isEdit ? "Güncelle" : "Ürün Ekle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
