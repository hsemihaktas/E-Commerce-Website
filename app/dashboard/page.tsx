"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DashboardStats from "../../components/dashboard/DashboardStats";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import RecentActivity from "../../components/dashboard/RecentActivity";
import { useAuth } from "../../contexts/AuthContext";
import { StoreSettings } from "../../types/store";
import { getStoreSettings } from "../../services/storeService";

export default function Dashboard() {
  const { user } = useAuth();
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    if (user?.uid) {
      loadStoreSettings();
    }
  }, [user?.uid]);

  const loadStoreSettings = async () => {
    try {
      const settings = await getStoreSettings(user!.uid);

      // Eğer mağaza ayarları yoksa veya eksikse anasayfaya yönlendir
      if (!settings || !settings.storeName || !settings.description) {
        router.push("/");
        return;
      }

      setStoreSettings(settings);
    } catch (error) {
      console.error("Mağaza ayarları yüklenirken hata:", error);
      router.push("/");
    }
  };
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {storeSettings ? storeSettings.storeName : "Dashboard"}
                </h1>
                <p className="mt-2 text-gray-600">
                  {storeSettings
                    ? `${storeSettings.description}`
                    : "E-ticaret mağazanızın genel durumunu buradan takip edebilirsiniz."}
                </p>
                {storeSettings?.contactInfo?.city && (
                  <p className="mt-1 text-sm text-gray-500">
                    📍 {storeSettings.contactInfo.city}
                  </p>
                )}
              </div>
              <div className="mt-4 sm:mt-0">
                <a
                  href={`/store/${user?.uid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Mağazamı Görüntüle
                </a>
              </div>
            </div>
          </div>{" "}
          {/* Real-time Stats Cards */}
          <DashboardStats />
          {/* Charts and Activity Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Category Distribution Chart */}
            <div className="xl:col-span-2">
              <DashboardCharts />
            </div>

            {/* Recent Activity */}
            <div className="xl:col-span-1">
              <RecentActivity />
            </div>
          </div>
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Hızlı İşlemler
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a
                  href="/dashboard/products"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-100">
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
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Ürün Yönetimi
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Ürünlerinizi ekleyin, düzenleyin veya silin.
                    </p>
                  </div>
                </a>
                <a
                  href="/dashboard/orders"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 group-hover:bg-green-100">
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
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Sipariş Yönetimi
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Müşteri siparişlerini takip edin ve yönetin.
                    </p>
                  </div>
                </a>
                <div className="relative group bg-gray-50 p-6 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-gray-200 text-gray-400">
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-500">
                      Satış Raporları
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Satış verilerinizi analiz edin. (Yakında)
                    </p>
                  </div>
                </div>{" "}
                <div className="relative group bg-gray-50 p-6 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-gray-200 text-gray-400">
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-500">
                      Ayarlar
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Mağaza ayarlarınızı yönetin. (Yakında)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
