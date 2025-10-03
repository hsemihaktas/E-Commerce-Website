"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
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

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");

  useEffect(() => {
    if (user?.uid) {
      loadOrders();
    }
  }, [user?.uid]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getStoreOrders(user!.uid);
      setOrders(ordersData);
    } catch (error) {
      console.error("Siparişler yüklenirken hata:", error);
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
      alert("Durum güncellenirken hata oluştu");
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
      alert("Ödeme durumu güncellenirken hata oluştu");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (
      confirm(
        "Bu siparişi iptal etmek istediğinizden emin misiniz? Stoklar geri yüklenecektir."
      )
    ) {
      try {
        await cancelOrder(orderId);
        await loadOrders();
      } catch (error: any) {
        console.error("Sipariş iptal hatası:", error);
        alert(error.message || "Sipariş iptal edilirken hata oluştu");
      }
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
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
            <p className="mt-2 text-gray-600">
              Müşteri siparişlerinizi buradan yönetebilirsiniz.
            </p>
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
                            <span className="mr-2">
                              ₺{order.total.toFixed(2)}
                            </span>
                            <span className="mr-4">•</span>
                            <span>{order.items.length} ürün</span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mt-3">
                        <div className="text-sm text-gray-600">
                          <strong>Ürünler:</strong>
                          {order.items.map((item, index) => (
                            <span key={index}>
                              {index > 0 && ", "}
                              {item.productName} ({item.quantity}x)
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex space-x-2">
                        {order.status !== "cancelled" &&
                          order.status !== "delivered" && (
                            <>
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusUpdate(
                                    order.id!,
                                    e.target.value as Order["status"]
                                  )
                                }
                                className="text-sm border border-gray-300 rounded px-2 py-1"
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
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="pending">Ödeme Bekliyor</option>
                                <option value="paid">Ödendi</option>
                                <option value="failed">Başarısız</option>
                                <option value="refunded">İade Edildi</option>
                              </select>

                              <button
                                onClick={() => handleCancelOrder(order.id!)}
                                className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                              >
                                İptal Et
                              </button>
                            </>
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
    </ProtectedRoute>
  );
}
