"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../components/LoginRegister/LoginForm";
import RegisterForm from "../components/LoginRegister/RegisterForm";
import Modal from "../components/LoginRegister/Modal";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const [tab, setTab] = useState("login");
  const [modalMessage, setModalMessage] = useState("");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (user) {
    return null; // Yönlendirme yapılıyor
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <button
            className={`flex-1 py-2 text-center font-medium text-sm border-b-2 ${
              tab === "login"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTab("login")}
          >
            Giriş Yap
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium text-sm border-b-2 ${
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
      {modalMessage && (
        <Modal message={modalMessage} onClose={() => setModalMessage("")} />
      )}
    </div>
  );
}
