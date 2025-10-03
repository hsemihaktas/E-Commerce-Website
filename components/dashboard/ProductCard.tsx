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
  createdAt: any;
  userId: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: () => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "products", product.id));
      onDelete();
      setShowConfirmModal(false);
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

  const formatDate = (date: any) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString("tr-TR");
    }
    return "Tarih belirtilmemiş";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Düzenle"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
            title="Sil"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v3a1 1 0 11-2 0V9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {product.description}
      </p>

      <div className="flex justify-between items-center mb-2">
        <span className="text-2xl font-bold text-green-600">
          ₺{product.price.toFixed(2)}
        </span>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {getCategoryLabel(product.category)}
        </span>
      </div>

      <p className="text-xs text-gray-500">
        Eklendi: {formatDate(product.createdAt)}
      </p>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Ürünü Sil"
        message={`"${product.name}" adlı ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        isLoading={isDeleting}
      />
    </div>
  );
}
