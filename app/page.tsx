"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginForm from "../components/LoginRegister/LoginForm";
import RegisterForm from "../components/LoginRegister/RegisterForm";
import Modal from "../components/LoginRegister/Modal";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const [tab, setTab] = useState("login");
  const [modalMessage, setModalMessage] = useState("");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - sadece giriş yapmamış kullanıcılar için göster */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🛍️ E-Ticaret</h1>
            </div>
            <div className="flex space-x-4">
              <a
                href="/store"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Mağazayı Keşfet
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex items-center justify-center min-h-screen`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Info */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                E-Ticaret
                <br />
                <span className="text-blue-600">Platformu</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                Kendi online mağazanızı kurun veya binlerce üründen alışveriş
                yapın. Güvenli, hızlı ve kolay!
              </p>

              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                <a
                  href="/store"
                  className="inline-block w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Alışverişe Başla
                </a>
                <button
                  onClick={() => setTab("register")}
                  className="inline-block w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Mağaza Aç
                </button>
              </div>

              {/* Features */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Hızlı Kurulum
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dakikalar içinde mağazanızı kurun
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Güvenli Ödeme
                  </h3>
                  <p className="text-sm text-gray-600">
                    Güvenilir ödeme sistemi
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-purple-600"
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
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Detaylı Analiz
                  </h3>
                  <p className="text-sm text-gray-600">
                    Satış verilerinizi takip edin
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Forms veya Hoş Geldin Mesajı */}
            {user ? (
              /* Giriş yapmış kullanıcılar için hoş geldin kartı */
              <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Hoş Geldiniz!
                  </h2>
                  <p className="text-gray-600">
                    Platformumuza başarıyla giriş yaptınız.
                  </p>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/dashboard"
                    className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Dashboard'a Git
                  </Link>
                  <Link
                    href="/store"
                    className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              </div>
            ) : (
              /* Giriş yapmamış kullanıcılar için auth formları */
              <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="flex justify-center mb-6">
                  <button
                    className={`flex-1 py-2 text-center font-medium text-sm border-b-2 transition-colors ${
                      tab === "login"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setTab("login")}
                  >
                    Giriş Yap
                  </button>
                  <button
                    className={`flex-1 py-2 text-center font-medium text-sm border-b-2 transition-colors ${
                      tab === "register"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setTab("register")}
                  >
                    Kayıt Ol
                  </button>
                </div>

                {tab === "login" && <LoginForm />}
                {tab === "register" && (
                  <RegisterForm setModalMessage={setModalMessage} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {modalMessage && (
        <Modal message={modalMessage} onClose={() => setModalMessage("")} />
      )}
    </div>
  );
}
