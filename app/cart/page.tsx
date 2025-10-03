"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../contexts/CartContext";
import CheckoutModal from "../../components/Checkout/CheckoutModal";
import GlobalNavbar from "../../components/layout/GlobalNavbar";

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemsCount,
  } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sepetim</h1>
          <p className="text-gray-600">
            {getCartItemsCount()} ürün • Toplam: ₺{getCartTotal().toFixed(2)}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sepetiniz boş
            </h3>
            <p className="text-gray-500 mb-6">
              Alışverişe başlamak için mağazamızı keşfedin!
            </p>
            <Link
              href="/store"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        ₺{item.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stok: {item.stock} adet
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>

                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Ürünü kaldır"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Ara Toplam:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ₺{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Sipariş Özeti
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Ara Toplam ({getCartItemsCount()} ürün):
                    </span>
                    <span className="font-medium">
                      ₺{getCartTotal().toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kargo:</span>
                    <span className="font-medium">
                      {getCartTotal() > 100 ? (
                        <span className="text-green-600">Ücretsiz</span>
                      ) : (
                        "₺15.00"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">KDV:</span>
                    <span className="font-medium">
                      ₺{(getCartTotal() * 0.18).toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Toplam:
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ₺
                        {(
                          getCartTotal() +
                          (getCartTotal() > 100 ? 0 : 15) +
                          getCartTotal() * 0.18
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {getCartTotal() <= 100 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>₺{(100 - getCartTotal()).toFixed(2)}</strong> daha
                      ekleyerek
                      <strong> ücretsiz kargo</strong> kazanın!
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3"
                >
                  Siparişi Tamamla
                </button>

                <Link
                  href="/store"
                  className="block w-full text-center text-blue-600 py-2 px-4 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setOrderSuccess(true);
            setShowCheckout(false);
          }}
        />

        {/* Success Message */}
        {orderSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sipariş Başarılı!
              </h3>
              <p className="text-gray-600 mb-6">
                Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlığa
                alınacaktır.
              </p>
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => setOrderSuccess(false)}
                >
                  Siparişlerimi Görüntüle
                </Link>
                <button
                  onClick={() => setOrderSuccess(false)}
                  className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
