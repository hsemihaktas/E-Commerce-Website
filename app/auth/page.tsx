"use client";

import { useState } from "react";
import Link from "next/link";
import LoginForm from "../../components/LoginRegister/LoginForm";
import RegisterForm from "../../components/LoginRegister/RegisterForm";
import Modal from "../../components/LoginRegister/Modal";
import GlobalNavbar from "../../components/layout/GlobalNavbar";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [modalMessage, setModalMessage] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <GlobalNavbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🛍️ E-Ticaret
              </h1>
            </Link>
            <p className="text-gray-600">
              Hesabınıza giriş yapın veya yeni hesap oluşturun
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
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

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Anasayfaya Dön
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-blue-600"
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
              <p className="text-xs text-gray-600">Güvenli</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-green-600"
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
              <p className="text-xs text-gray-600">Hızlı</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2-5.5V9a2 2 0 012-2 2 2 0 012 2v7.5M5 21h14"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-600">Ücretsiz</p>
            </div>
          </div>
        </div>

        {modalMessage && (
          <Modal message={modalMessage} onClose={() => setModalMessage("")} />
        )}
      </div>
    </div>
  );
}
