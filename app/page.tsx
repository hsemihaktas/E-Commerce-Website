"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { getStoreSettings } from "../services/storeService";
import GlobalNavbar from "../components/layout/GlobalNavbar";

export default function Home() {
  const { user, loading } = useAuth();
  const [hasStore, setHasStore] = useState(false);
  const [checkingStore, setCheckingStore] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      checkUserStore();
    } else {
      setHasStore(false);
      setCheckingStore(false);
    }
  }, [user?.uid]);

  const checkUserStore = async () => {
    try {
      setCheckingStore(true);
      const settings = await getStoreSettings(user!.uid);
      const isStoreComplete =
        settings && settings.storeName && settings.description;
      setHasStore(!!isStoreComplete);
    } catch (error) {
      console.error("Mağaza kontrolü hatası:", error);
      setHasStore(false);
    } finally {
      setCheckingStore(false);
    }
  };

  return (
    <div className="min-h-screen">
      <GlobalNavbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Türkiye'nin En Büyük
              <br />
              <span className="text-yellow-300">E-Ticaret Platformu</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Binlerce üründen seçim yapın, güvenli alışveriş yapın. Kendi
              mağazanızı açarak satış yapmaya bugün başlayın!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/store"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Alışverişe Başla
              </Link>
              {(!user || (user && !checkingStore && !hasStore)) && (
                <Link
                  href={user ? "/create-store" : "/auth"}
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Mağaza Aç
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Neden E-Ticaret Platformumuz?
            </h2>
            <p className="text-lg text-gray-600">
              Modern, güvenli ve kullanıcı dostu alışveriş deneyimi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hızlı Teslimat
              </h3>
              <p className="text-gray-600">
                24 saat içinde kapınızda, ücretsiz kargo avantajı
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Güvenli Ödeme
              </h3>
              <p className="text-gray-600">
                SSL sertifikalı güvenli ödeme, 256-bit şifreleme
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                7/24 Destek
              </h3>
              <p className="text-gray-600">
                Canlı destek hattı, anında çözüm garantisi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Kendi Mağazanızı Açmaya Hazır mısınız?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Dakikalar içinde online mağazanızı kurun ve satışa başlayın
            </p>
            {!user || (user && !checkingStore && !hasStore) ? (
              <Link
                href={user ? "/create-store" : "/auth"}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                {user ? "Mağazanızı Oluşturun" : "Ücretsiz Mağaza Aç"}
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            ) : (
              user &&
              hasStore && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Mağazanızı Yönetin
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">🛍️ E-Ticaret</h3>
              <p className="text-gray-300 mb-4">
                Türkiye'nin en güvenilir e-ticaret platformu. Binlerce ürün,
                güvenli ödeme ve hızlı teslimat.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/store" className="hover:text-white">
                    Mağaza
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-white">
                    Siparişlerim
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Yardım
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    İletişim
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Satıcı Ol</h4>
              <ul className="space-y-2 text-gray-300">
                {!user || (user && !checkingStore && !hasStore) ? (
                  <li>
                    <Link
                      href={user ? "/create-store" : "/auth"}
                      className="hover:text-white text-yellow-400 font-medium"
                    >
                      Mağaza Aç
                    </Link>
                  </li>
                ) : (
                  user &&
                  hasStore && (
                    <li>
                      <Link
                        href="/dashboard"
                        className="hover:text-white text-yellow-400 font-medium"
                      >
                        Mağaza Yönetimi
                      </Link>
                    </li>
                  )
                )}
                <li>
                  <a href="#" className="hover:text-white">
                    Satıcı Rehberi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Ücretler
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 E-Ticaret Platformu. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
