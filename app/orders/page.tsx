"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserOrders } from "../../services/orderService";
import {
  Order,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../../types/order";
import Link from "next/link";
import AlertModal from "../../components/ui/AlertModal";
import GlobalNavbar from "../../components/layout/GlobalNavbar";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (user?.email) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await getUserOrders(user!.email!);
      setOrders(userOrders);
    } catch (error: any) {
      console.error("Siparişler yüklenemedi:", error);

      if (error.code === "permission-denied") {
        console.log(
          "Firestore permission hatası - muhtemelen henüz sipariş yok veya kurallar ayarlanmamış"
        );
        setOrders([]); // Boş liste göster
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (
      window.confirm(
        "Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      )
    ) {
      try {
        const { cancelOrder } = await import("../../services/orderService");
        await cancelOrder(orderId);
        await loadOrders(); // Siparişleri yeniden yükle
        setAlertConfig({
          type: "success",
          title: "Başarılı",
          message: "Siparişiniz başarıyla iptal edildi!",
        });
        setShowAlertModal(true);
      } catch (error: any) {
        console.error("Sipariş iptal hatası:", error);
        setAlertConfig({
          type: "error",
          title: "Hata",
          message: `Sipariş iptal edilirken hata: ${error.message}`,
        });
        setShowAlertModal(true);
      }
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-orange-100 text-orange-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.pending;
  };

  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.pending;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giriş Gerekli
          </h2>
          <p className="text-gray-600 mb-6">
            Siparişlerinizi görmek için giriş yapmanız gerekiyor.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Siparişlerim
          </h1>
          <p className="text-gray-600">
            Geçmiş siparişlerinizi ve durumlarını buradan takip edebilirsiniz.
          </p>
        </div>

        {orders.length === 0 ? (
          /* Sipariş Yok */
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz Siparişiniz Yok
            </h3>
            <p className="text-gray-500 mb-6">
              İlk siparişinizi vermek için mağazamızı keşfedin!
            </p>
            <Link
              href="/store"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          /* Sipariş Listesi */
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Sipariş Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sipariş #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.createdAt
                          ?.toDate?.()
                          ?.toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) || "Tarih bilgisi yok"}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                      </span>
                    </div>
                  </div>

                  {/* Sipariş Özet */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Ürün Sayısı</p>
                      <p className="font-semibold">{order.items.length} ürün</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Toplam Tutar</p>
                      <p className="font-semibold text-blue-600">
                        ₺{order.total.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ödeme Yöntemi</p>
                      <p className="font-semibold capitalize">
                        {order.paymentMethod === "cash"
                          ? "Kapıda Ödeme"
                          : order.paymentMethod === "card"
                          ? "Kredi Kartı"
                          : order.paymentMethod === "transfer"
                          ? "Havale/EFT"
                          : "Online"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teslimat Adresi</p>
                      <p className="font-semibold text-sm">
                        {order.customer.address.city}
                      </p>
                    </div>
                  </div>

                  {/* Ürün Listesi (Özet) */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Sipariş İçeriği
                    </h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-600">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-medium">
                            ₺{item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 3} ürün daha...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sipariş Takip */}
                  {order.tracking && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Kargo Takip
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">
                            {order.tracking.company}:
                          </span>{" "}
                          {order.tracking.trackingNumber}
                        </p>
                        {order.tracking.url && (
                          <a
                            href={order.tracking.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Kargonu Takip Et →
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Aksiyon Butonları */}
                  <div className="border-t pt-4 mt-4 flex justify-between items-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Detayları Görüntüle
                    </button>

                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(order.id!)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
                      >
                        Siparişi İptal Et
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sipariş Detay Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sipariş Detayı #{selectedOrder.orderNumber}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Detaylı Ürün Listesi */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Sipariş İçeriği
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                            Birim Fiyat: ₺{item.productPrice.toFixed(2)} ×{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold">
                          ₺{item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fiyat Detayı */}
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Ara Toplam</span>
                      <span>₺{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kargo</span>
                      <span>
                        {selectedOrder.shipping === 0
                          ? "Ücretsiz"
                          : `₺${selectedOrder.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>KDV</span>
                      <span>₺{selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 font-bold text-lg">
                      <div className="flex justify-between">
                        <span>Toplam</span>
                        <span>₺{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teslimat Bilgileri */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Teslimat Bilgileri
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="font-medium">{selectedOrder.customer.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.customer.phone}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedOrder.customer.address.street}
                      <br />
                      {selectedOrder.customer.address.city}{" "}
                      {selectedOrder.customer.address.postalCode}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        <AlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
        />
      </div>
    </div>
  );
}
