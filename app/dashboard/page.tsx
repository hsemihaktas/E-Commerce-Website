"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../firebaseConfig";

export default function Dashboard() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">
              E-Commerce Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Hoş geldiniz, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
            <p className="text-gray-600">
              Bu alan korumalı bir sayfadır. Sadece giriş yapmış kullanıcılar
              görebilir.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
