"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "../../firebaseConfig";
import Modal from "./Modal";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await loginWithEmail(email, password);
      const userName = user.email ? user.email.split("@")[0] : "Kullanıcı";
      setModalMessage(
        `Başarılı giriş! Hoş geldiniz, ${userName}. Anasayfaya gitmek için tamam'a tıklayın.`
      );
      setShouldRedirect(true);
    } catch (error: any) {
      if (error?.code === "auth/invalid-credential") {
        setModalMessage(
          "Email veya şifre hatalı. Lütfen kontrol edip tekrar deneyin."
        );
      } else if (error?.code === "auth/wrong-password") {
        setModalMessage("Hatalı şifre. Lütfen tekrar deneyin.");
      } else if (error?.code === "auth/user-not-found") {
        setModalMessage("Kullanıcı bulunamadı. Lütfen kayıt olun.");
      } else if (error?.code === "auth/invalid-email") {
        setModalMessage("Geçersiz email formatı.");
      } else if (error?.code === "auth/too-many-requests") {
        setModalMessage(
          "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin."
        );
      } else {
        setModalMessage(
          "Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} method="POST" className="space-y-4">
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
          Giriş Yap
        </button>
      </form>
      {modalMessage && (
        <Modal
          message={modalMessage}
          onClose={() => {
            setModalMessage("");
            setShouldRedirect(false);
            if (shouldRedirect) {
              router.push("/");
            }
          }}
        />
      )}
    </>
  );
}
