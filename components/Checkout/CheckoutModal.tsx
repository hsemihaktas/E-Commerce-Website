"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { createOrder } from "../../services/orderService";
import { Customer } from "../../types/order";
import AlertModal from "../ui/AlertModal";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    paymentMethod: "cash" as "cash" | "card" | "transfer" | "online",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email || cartItems.length === 0) {
      setAlertConfig({
        type: "error",
        title: "Hata",
        message: "Giriş yapmanız ve sepetinizde ürün bulunması gerekiyor!",
      });
      setShowAlertModal(true);
      return;
    }

    // Form validasyonu
    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "district",
      "postalCode",
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setAlertConfig({
          type: "error",
          title: "Eksik Bilgi",
          message: `${field} alanı zorunludur!`,
        });
        setShowAlertModal(true);
        return;
      }
    }

    try {
      setLoading(true);

      // Müşteri bilgileri
      const customer: Customer = {
        email: user.email,
        name: formData.fullName,
        phone: formData.phone,
        address: {
          street: `${formData.address}, ${formData.district}`,
          city: formData.city,
          postalCode: formData.postalCode,
          country: "Türkiye",
        },
      };

      // Sipariş öğeleri
      // Ürünleri satıcıya göre grupla
      console.log(
        "🛒 Cart items before grouping:",
        cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          storeId: item.storeId,
          userId: item.userId,
        }))
      );

      const ordersByStore = cartItems.reduce((groups, item) => {
        const storeId = item.storeId || item.userId || "default-store";
        console.log(`📦 Grouping item ${item.name} to store: ${storeId}`);

        if (!groups[storeId]) {
          groups[storeId] = [];
        }
        groups[storeId].push({
          productId: item.id,
          productName: item.name,
          productPrice: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
        });
        return groups;
      }, {} as Record<string, any[]>);

      console.log("📦 Orders grouped by store:", ordersByStore);

      // Her satıcı için ayrı sipariş oluştur
      const createdOrders = [];
      for (const [storeOwnerId, orderItems] of Object.entries(ordersByStore)) {
        console.log(
          "🛍️ Creating order for store:",
          storeOwnerId,
          "Items:",
          orderItems.length
        );

        const orderId = await createOrder(
          storeOwnerId,
          customer,
          orderItems,
          formData.paymentMethod
        );

        createdOrders.push(orderId);
        console.log("✅ Order created:", orderId);
      }

      console.log("📦 All orders created:", createdOrders);

      // Sepeti temizle
      clearCart();

      // Başarı callback'i çağır
      onSuccess();

      alert("Siparişiniz başarıyla oluşturuldu!");
      onClose();
    } catch (error: any) {
      console.error("Sipariş oluşturma hatası:", error);

      let errorMessage = "Sipariş oluşturulurken bir hata oluştu!";

      if (error.code === "permission-denied") {
        errorMessage =
          "Sipariş oluşturmak için gerekli izinler bulunmuyor. Lütfen giriş yaptığınızdan emin olun.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlertConfig({
        type: "error",
        title: "Hata",
        message: errorMessage,
      });
      setShowAlertModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Sipariş Tamamla
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              disabled={loading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Teslimat Bilgileri */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Teslimat Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İl *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlçe *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posta Kodu *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Ödeme Yöntemi */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ödeme Yöntemi
              </h3>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Kapıda Nakit Ödeme</option>
                <option value="card">Kredi Kartı</option>
                <option value="transfer">Havale/EFT</option>
                <option value="online">Online Ödeme</option>
              </select>
            </div>

            {/* Sipariş Özeti */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sipariş Özeti
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span>₺{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span>
                    {shipping === 0 ? "Ücretsiz" : `₺${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>KDV (%18)</span>
                  <span>₺{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 font-bold text-lg">
                  <div className="flex justify-between">
                    <span>Toplam</span>
                    <span>₺{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Sipariş Veriliyor..." : "Siparişi Tamamla"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
      />
    </div>
  );
}
