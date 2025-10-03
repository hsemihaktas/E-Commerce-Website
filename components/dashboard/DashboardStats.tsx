"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";

interface StatsData {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStock: number;
  // Order stats
  totalOrders: number;
  pendingOrders: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export default function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // Products query
    const productsQuery = query(
      collection(db, "products"),
      where("userId", "==", user.uid)
    );

    // Orders query
    const ordersQuery = query(
      collection(db, "orders"),
      where("storeOwnerId", "==", user.uid)
    );

    let productStats = {
      totalProducts: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalStock: 0,
    };

    let orderStats = {
      totalOrders: 0,
      pendingOrders: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
    };

    const unsubscribeProducts = onSnapshot(productsQuery, (querySnapshot) => {
      let totalProducts = 0;
      let totalValue = 0;
      let lowStockItems = 0;
      let outOfStockItems = 0;
      let totalStock = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalProducts++;
        totalValue += (data.price || 0) * (data.stock || 0);
        totalStock += data.stock || 0;

        const currentStock = data.stock || 0;
        if (currentStock === 0) {
          outOfStockItems++;
        } else if (currentStock <= 5) {
          lowStockItems++;
        }
      });

      productStats = {
        totalProducts,
        totalValue,
        lowStockItems,
        outOfStockItems,
        totalStock,
      };

      setStats({
        ...productStats,
        ...orderStats,
      });
      setLoading(false);
    });

    const unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
      let totalOrders = 0;
      let pendingOrders = 0;
      let totalEarnings = 0;
      let pendingEarnings = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        totalOrders++;

        if (data.status === "delivered" && data.paymentStatus === "paid") {
          totalEarnings += data.total || 0;
        } else if (data.status !== "cancelled" && data.status !== "delivered") {
          pendingOrders++;
          pendingEarnings += data.total || 0;
        }
      });

      orderStats = {
        totalOrders,
        pendingOrders,
        totalEarnings,
        pendingEarnings,
      };

      setStats({
        ...productStats,
        ...orderStats,
      });
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [user?.uid]);

  const statsData = [
    {
      name: "Kazanılan Para",
      value: `₺${stats.totalEarnings.toFixed(2)}`,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: null,
      priority: true,
    },
    {
      name: "Bekleyen Kazanç",
      value: `₺${stats.pendingEarnings.toFixed(2)}`,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: null,
      priority: true,
    },
    {
      name: "Toplam Sipariş",
      value: stats.totalOrders,
      icon: (
        <svg
          className="h-6 w-6"
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
      ),
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: null,
      priority: true,
    },
    {
      name: "Bekleyen Sipariş",
      value: stats.pendingOrders,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: null,
      priority: true,
    },
    {
      name: "Toplam Ürün",
      value: stats.totalProducts,
      icon: (
        <svg
          className="h-6 w-6"
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
      ),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: null,
    },
    {
      name: "Stok Değeri",
      value: `₺${stats.totalValue.toFixed(2)}`,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      ),
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      change: null,
    },
    {
      name: "Stok Bitti",
      value: stats.outOfStockItems,
      icon: (
        <svg
          className="h-6 w-6"
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
      ),
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: null,
    },
    {
      name: "Az Stok",
      value: stats.lowStockItems,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: null,
    },
    {
      name: "Toplam Stok",
      value: stats.totalStock,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      change: null,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Priority Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white overflow-hidden shadow rounded-lg animate-pulse"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 w-0 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-7 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Secondary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white overflow-hidden shadow-sm rounded-lg animate-pulse"
            >
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="ml-3 w-0 flex-1">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const priorityStats = statsData.filter((stat) => stat.priority);
  const secondaryStats = statsData.filter((stat) => !stat.priority);

  return (
    <div className="space-y-6">
      {/* Priority Stats - Bigger cards for important metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {priorityStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-xl font-bold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats - Smaller cards for supporting metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {secondaryStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} p-2 rounded`}>
                  <div className={`${stat.color} w-5 h-5`}>{stat.icon}</div>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
