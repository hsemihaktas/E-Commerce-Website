"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { getStoreSettings } from "../../../services/storeService";
import ProtectedRoute from "../../../components/ProtectedRoute";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import {
  Order,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../../../types/order";
import {
  getStoreOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
} from "../../../services/orderService";
import ConfirmModal from "../../../components/dashboard/ConfirmModal";
import AlertModal from "../../../components/ui/AlertModal";

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      checkStoreAndLoadOrders();
    }
  }, [user?.uid]);

  const checkStoreAndLoadOrders = async () => {
    try {
      const settings = await getStoreSettings(user!.uid);
      if (!settings || !settings.storeName || !settings.description) {
        router.push("/");
        return;
      }
      loadOrders();
    } catch (error) {
      router.push("/");
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getStoreOrders(user!.uid);
      setOrders(ordersData);
    } catch (error) {
      console.error("❌ Siparişler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Refresh the list
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
    }
  };

  const handlePaymentStatusUpdate = async (
    orderId: string,
    newStatus: Order["paymentStatus"]
  ) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
      await loadOrders();
    } catch (error) {
      console.error("Ödeme durumu güncelleme hatası:", error);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowConfirmModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    setIsLoading(true);
    try {
      await cancelOrder(orderToCancel);
      await loadOrders();
      setShowConfirmModal(false);
      setAlertConfig({
        type: "success",
        title: "Başarılı",
        message: "Sipariş başarıyla iptal edildi!",
      });
      setShowAlertModal(true);
    } catch (error: any) {
      setShowConfirmModal(false);
      setAlertConfig({
        type: "error",
        title: "Hata",
        message: `Sipariş iptal edilirken hata: ${error.message}`,
      });
      setShowAlertModal(true);
    } finally {
      setIsLoading(false);
      setOrderToCancel(null);
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  const getStatusBadgeColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentBadgeColor = (status: Order["paymentStatus"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header & Stats */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
                <p className="mt-2 text-gray-600">
                  Müşteri siparişlerinizi buradan yönetebilirsiniz.
                </p>
              </div>

              {/* Earning Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">
                    Kazanılan Para
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    ₺
                    {orders
                      .filter(
                        (o) =>
                          o.status === "delivered" && o.paymentStatus === "paid"
                      )
                      .reduce((sum, o) => sum + o.total, 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-xs text-green-500">
                    {
                      orders.filter(
                        (o) =>
                          o.status === "delivered" && o.paymentStatus === "paid"
                      ).length
                    }{" "}
                    teslim edildi
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">
                    Bekleyen Kazanç
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₺
                    {orders
                      .filter(
                        (o) =>
                          o.status !== "delivered" && o.status !== "cancelled"
                      )
                      .reduce((sum, o) => sum + o.total, 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-500">
                    {
                      orders.filter(
                        (o) =>
                          o.status !== "delivered" && o.status !== "cancelled"
                      ).length
                    }{" "}
                    sipariş işlemde
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "all", label: "Tümü", count: orders.length },
                {
                  key: "pending",
                  label: "Beklemede",
                  count: orders.filter((o) => o.status === "pending").length,
                },
                {
                  key: "confirmed",
                  label: "Onaylandı",
                  count: orders.filter((o) => o.status === "confirmed").length,
                },
                {
                  key: "preparing",
                  label: "Hazırlanıyor",
                  count: orders.filter((o) => o.status === "preparing").length,
                },
                {
                  key: "shipped",
                  label: "Kargoda",
                  count: orders.filter((o) => o.status === "shipped").length,
                },
                {
                  key: "delivered",
                  label: "Teslim Edildi",
                  count: orders.filter((o) => o.status === "delivered").length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Sipariş bulunamadı
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === "all"
                  ? "Henüz hiç sipariş alınmamış."
                  : `${
                      ORDER_STATUS_LABELS[filter as Order["status"]]
                    } durumunda sipariş bulunamadı.`}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <li key={order.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {order.orderNumber}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {order.customer.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.customer.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              order.status
                            )}`}
                          >
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeColor(
                              order.paymentStatus
                            )}`}
                          >
                            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="mr-2 font-semibold text-gray-900">
                              ₺{order.total.toFixed(2)}
                            </span>
                            <span className="mr-4">•</span>
                            <span>{order.items.length} ürün</span>
                            <span className="mr-4">•</span>
                            <span className="text-xs">
                              {order.paymentMethod === "cash"
                                ? "💵 Nakit"
                                : order.paymentMethod === "card"
                                ? "💳 Kart"
                                : order.paymentMethod === "transfer"
                                ? "🏦 Havale"
                                : order.paymentMethod === "online"
                                ? "🌐 Online"
                                : "💰"}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span>📅 {formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="mt-3 grid md:grid-cols-2 gap-4">
                        <div className="text-sm text-gray-600">
                          <strong>Ürünler:</strong>
                          <div className="mt-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span>
                                  {item.productName} ({item.quantity}x)
                                </span>
                                <span className="font-medium">
                                  ₺{item.totalPrice.toFixed(2)}
                                </span>
                              </div>
                            ))}
                            <div className="border-t pt-1 mt-1 flex justify-between font-semibold">
                              <span>Toplam:</span>
                              <span>₺{order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <strong>Teslimat Adresi:</strong>
                          <div className="mt-1">
                            <p>{order.customer.address.street}</p>
                            <p>
                              {order.customer.address.city}{" "}
                              {order.customer.address.postalCode}
                            </p>
                            <p>{order.customer.address.country}</p>
                            <p className="mt-1 text-blue-600">
                              📞 {order.customer.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {order.status !== "cancelled" &&
                          order.status !== "delivered" && (
                            <>
                              {/* Quick Action Buttons */}
                              {order.status === "pending" && (
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(order.id!, "confirmed")
                                  }
                                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-medium"
                                >
                                  ✓ Onayla
                                </button>
                              )}

                              {order.status === "confirmed" && (
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(order.id!, "preparing")
                                  }
                                  className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 font-medium"
                                >
                                  🍽️ Hazırlamaya Başla
                                </button>
                              )}

                              {order.status === "preparing" && (
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(order.id!, "shipped")
                                  }
                                  className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 font-medium"
                                >
                                  📦 Kargoya Ver
                                </button>
                              )}

                              {order.status === "shipped" && (
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(order.id!, "delivered")
                                  }
                                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 font-medium"
                                >
                                  🚚 Teslim Edildi
                                </button>
                              )}

                              {/* Payment Status */}
                              {order.paymentStatus === "pending" && (
                                <button
                                  onClick={() =>
                                    handlePaymentStatusUpdate(order.id!, "paid")
                                  }
                                  className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded hover:bg-emerald-200 font-medium"
                                >
                                  💰 Ödeme Alındı
                                </button>
                              )}

                              {/* Detailed Selects for fine control */}
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusUpdate(
                                    order.id!,
                                    e.target.value as Order["status"]
                                  )
                                }
                                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                              >
                                <option value="pending">Beklemede</option>
                                <option value="confirmed">Onaylandı</option>
                                <option value="preparing">Hazırlanıyor</option>
                                <option value="shipped">Kargoda</option>
                                <option value="delivered">Teslim Edildi</option>
                              </select>

                              <select
                                value={order.paymentStatus}
                                onChange={(e) =>
                                  handlePaymentStatusUpdate(
                                    order.id!,
                                    e.target.value as Order["paymentStatus"]
                                  )
                                }
                                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                              >
                                <option value="pending">Ödeme Bekliyor</option>
                                <option value="paid">Ödendi</option>
                                <option value="failed">Başarısız</option>
                                <option value="refunded">İade Edildi</option>
                              </select>

                              <button
                                onClick={() => handleCancelOrder(order.id!)}
                                className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 font-medium"
                              >
                                ❌ İptal Et
                              </button>
                            </>
                          )}

                        {/* Delivered Order Info */}
                        {order.status === "delivered" &&
                          order.paymentStatus === "paid" && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded font-medium">
                                ✅ Tamamlandı - Kazanç: ₺
                                {order.total.toFixed(2)}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setOrderToCancel(null);
        }}
        onConfirm={confirmCancelOrder}
        title="Siparişi İptal Et"
        message="Bu siparişi iptal etmek istediğinizden emin misiniz? Stoklar geri yüklenecektir."
        confirmText="Evet, İptal Et"
        cancelText="Hayır"
        isLoading={isLoading}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
      />
    </ProtectedRoute>
  );
}
