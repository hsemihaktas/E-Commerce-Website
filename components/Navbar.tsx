"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../firebaseConfig";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Çıkış yaparken hata:", error);
    }
  };

  // Dashboard sayfalarında ve ana sayfada navbar gösterme
  if (pathname?.startsWith("/dashboard") || pathname === "/") {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Sol */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🛍️</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                E-Ticaret
              </span>
            </Link>
          </div>

          {/* Navigation Links - Orta */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/store"
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/store" ? "text-blue-600 bg-blue-50" : ""
              }`}
            >
              Mağaza
            </Link>
            <Link
              href="/categories"
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/categories" ? "text-blue-600 bg-blue-50" : ""
              }`}
            >
              Kategoriler
            </Link>
            <Link
              href="/about"
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/about" ? "text-blue-600 bg-blue-50" : ""
              }`}
            >
              Hakkımızda
            </Link>
          </div>

          {/* Sağ Taraf - Sepet ve Menu */}
          <div className="flex items-center space-x-4">
            {/* Sepetim */}
            <Link
              href="/cart"
              className="relative group p-2 text-gray-700 hover:text-blue-600 transition-colors"
              title="Sepetim"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6h9M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h5a2 2 0 002-2v-.5M16 19h2a2 2 0 002-2v-.5"
                />
              </svg>
              {/* Sepet Badge - Gelecekte sepet item sayısı için */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                0
              </span>
            </Link>

            {/* Login/Dashboard Button */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Giriş Yap
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              aria-label="Ana menü"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/store"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === "/store"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Mağaza
              </Link>
              <Link
                href="/categories"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === "/categories"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Kategoriler
              </Link>
              <Link
                href="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === "/about"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link
                href="/cart"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === "/cart"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sepetim
              </Link>
              <div className="pt-2 space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block w-full text-left px-3 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 bg-gray-600 text-white rounded-md text-base font-medium hover:bg-gray-700 transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <Link
                    href="/"
                    className="block w-full text-left px-3 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
