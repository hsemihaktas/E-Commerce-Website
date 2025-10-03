"use client";

import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import ConfirmModal from "./ConfirmModal";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  createdAt: any;
  storeId: string;
  storeName?: string;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: () => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "products", productToDelete.id));
      onDelete();
      setShowConfirmModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Ürün silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      elektronik: "Elektronik",
      giyim: "Giyim",
      "ev-yasam": "Ev & Yaşam",
      spor: "Spor",
      kitap: "Kitap",
      oyuncak: "Oyuncak",
      kozmetik: "Kozmetik",
      diger: "Diğer",
    };
    return categories[category] || category;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "Stokta Yok";
    if (stock <= 5) return "Az Stok";
    return "Stokta";
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock <= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900">
              Ürün Adı
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900">
              Kategori
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900">
              Stok Durumu
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900">
              Stok Adedi
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900">
              Fiyat
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {product.description}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getCategoryLabel(product.category)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStockStatusColor(
                    product.stock || 0
                  )}`}
                >
                  {getStockStatus(product.stock || 0)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.stock || 0} adet
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₺{product.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 rounded-full hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Düzenle"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteClick(product)}
                  disabled={isDeleting}
                  className="p-2 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600 disabled:opacity-50 transition-colors"
                  title="Sil"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 11-2 0V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {productToDelete && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setProductToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Ürünü Sil"
          message={`"${productToDelete.name}" adlı ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
          confirmText="Sil"
          cancelText="İptal"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
