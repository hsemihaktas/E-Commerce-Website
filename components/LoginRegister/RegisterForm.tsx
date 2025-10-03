"use client";

import { useState } from "react";
import { registerWithEmail } from "../../firebaseConfig";

export default function RegisterForm({
  setModalMessage,
}: {
  setModalMessage: (message: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await registerWithEmail(email, password);
      setModalMessage(`Kayıt başarılı: ${user.email}`);
    } catch (error: any) {
      // Firebase hata kodlarını kontrol et
      if (error?.code === "auth/email-already-in-use") {
        setModalMessage(
          "Bu email adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin."
        );
      } else if (error?.code === "auth/invalid-email") {
        setModalMessage("Geçersiz email adresi.");
      } else if (error?.code === "auth/weak-password") {
        setModalMessage("Şifre çok zayıf. En az 6 karakter olmalıdır.");
      } else if (error?.code === "auth/missing-password") {
        setModalMessage("Lütfen bir şifre girin.");
      } else if (error?.message) {
        // Özel hata mesajları için (firebaseConfig'den gelen)
        setModalMessage(error.message);
      } else {
        setModalMessage(
          "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
    }
  };

  return (
    <form onSubmit={handleRegister} method="POST" className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Kayıt Ol
      </button>
    </form>
  );
}
