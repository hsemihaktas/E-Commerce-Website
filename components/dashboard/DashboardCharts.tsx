"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function DashboardCharts() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "products"),
      where("storeId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const categories: { [key: string]: number } = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.category || "Diğer";
        categories[category] = (categories[category] || 0) + 1;
      });

      const colors = [
        "#3B82F6", // Blue
        "#10B981", // Green
        "#F59E0B", // Yellow
        "#EF4444", // Red
        "#8B5CF6", // Purple
        "#F97316", // Orange
        "#06B6D4", // Cyan
        "#84CC16", // Lime
      ];

      const data = Object.entries(categories).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }));

      setChartData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const maxValue = Math.max(...chartData.map((d) => d.value));

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-6 bg-gray-200 rounded"></div>
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Kategori Dağılımı
        </h3>
        <div className="text-center py-8">
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Henüz ürün bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Kategori Dağılımı
      </h3>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center">
            <div className="w-16 text-sm font-medium text-gray-900 truncate">
              {item.name}
            </div>
            <div className="flex-1 mx-4">
              <div className="relative">
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-8 text-sm font-semibold text-gray-900 text-right">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 truncate">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
