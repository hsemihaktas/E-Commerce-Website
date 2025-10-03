"use client";

import { useState, useEffect, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { createOrder } from "../../../services/orderService";
import { Customer, OrderItem } from "../../../types/order";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  imageUrl?: string;
  userId: string;
  createdAt?: any;
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const router = useRouter();

  // Müşteri bilgileri formu
  const [customerInfo, setCustomerInfo] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
      country: "Türkiye",
    },
  });

  useEffect(() => {
    loadProduct();
  }, [resolvedParams.productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productDoc = await getDoc(doc(db, "products", resolvedParams.productId));

      if (productDoc.exists()) {
        setProduct({
          id: productDoc.id,
          ...productDoc.data(),
        } as Product);
      } else {
        console.error("Ürün bulunamadı");
      }
    } catch (error) {
      console.error("Ürün yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!product) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };

    const subtotal = product.price * quantity;
    const shipping = subtotal > 100 ? 0 : 15; // 100 TL üzeri kargo bedava
    const tax = subtotal * 0.18; // KDV %18
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      // Müşteri bilgilerini kontrol et
      if (
        !customerInfo.name ||
        !customerInfo.email ||
        !customerInfo.phone ||
        !customerInfo.address.street ||
        !customerInfo.address.city
      ) {
        alert("Lütfen tüm müşteri bilgilerini doldurun!");
        return;
      }

      if (quantity > product.stock) {
        alert("Seçilen miktar stok miktarını aşıyor!");
        return;
      }

      setOrdering(true);

      // Sipariş kalemini hazırla
      const orderItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        quantity: quantity,
        totalPrice: product.price * quantity,
      };

      // Siparişi oluştur
      const orderId = await createOrder(
        product.userId,
        customerInfo,
        [orderItem],
        "cash" // Default olarak kapıda ödeme
      );

      alert(`Siparişiniz başarıyla oluşturuldu! 
      
Sipariş detayları:
• Ürün: ${product.name}
• Miktar: ${quantity}
• Toplam: ₺${calculateTotals().total.toFixed(2)}

Siparişiniz en kısa sürede hazırlanacak ve size ulaştırılacaktır.`);

      // Modal'ı kapat ve ana sayfaya yönlendir
      setShowBuyModal(false);
      router.push("/store");
    } catch (error: any) {
      console.error("Sipariş oluşturma hatası:", error);
      alert(error.message || "Sipariş oluşturulurken hata oluştu!");
    } finally {
      setOrdering(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Ürün bulunamadı
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bu ürün mevcut değil veya kaldırılmış.
          </p>
          <div className="mt-6">
            <Link
              href="/store"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Mağazaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/store" className="text-gray-700 hover:text-blue-600">
                Mağaza
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">
                  {product.category}
                </span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2 truncate">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md flex items-center justify-center">
                <svg
                  className="h-24 w-24 text-blue-300"
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
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {product.category || "Genel"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center mb-6">
              <span className="text-4xl font-bold text-blue-600">
                ₺{product.price.toFixed(2)}
              </span>
              <span
                className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 10
                    ? "bg-green-100 text-green-800"
                    : product.stock > 0
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock > 0 ? `${product.stock} stokta` : "Stok yok"}
              </span>
            </div>

            <div className="prose prose-gray mb-8">
              <p className="text-gray-700 leading-relaxed">
                {product.description ||
                  "Bu ürün için henüz açıklama eklenmemiş."}
              </p>
            </div>

            {product.stock > 0 && (
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    Miktar:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    (Maksimum: {product.stock})
                  </span>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Birim fiyat:</span>
                    <span>₺{product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Miktar:</span>
                    <span>{quantity} adet</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ara toplam:</span>
                    <span>₺{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kargo:</span>
                    <span>
                      ₺{totals.shipping.toFixed(2)}{" "}
                      {totals.shipping === 0 && "(Ücretsiz)"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>KDV:</span>
                    <span>₺{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Toplam:</span>
                    <span className="text-blue-600">
                      ₺{totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
                >
                  Hemen Satın Al - ₺{totals.total.toFixed(2)}
                </button>

                <div className="text-center">
                  <Link
                    href={`/store/${product.userId}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Bu satıcının diğer ürünlerini görüntüle →
                  </Link>
                </div>
              </div>
            )}

            {product.stock === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Bu ürün şu anda stokta yok.
                </p>
                <Link
                  href="/store"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                >
                  Benzer Ürünleri Görüntüle
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Buy Now Modal */}
        {showBuyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sipariş Bilgileri
                  </h2>
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Sipariş Özeti
                  </h3>
                  <div className="flex justify-between items-center">
                    <span>
                      {product.name} x {quantity}
                    </span>
                    <span className="font-bold text-blue-600">
                      ₺{totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            name: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            email: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            phone: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şehir *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.address.city}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            address: {
                              ...customerInfo.address,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres *
                    </label>
                    <textarea
                      value={customerInfo.address.street}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          address: {
                            ...customerInfo.address,
                            street: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Mahalle, sokak, kapı numarası"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posta Kodu
                    </label>
                    <input
                      type="text"
                      value={customerInfo.address.postalCode}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          address: {
                            ...customerInfo.address,
                            postalCode: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="34000"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBuyModal(false)}
                    disabled={ordering}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={ordering}
                    className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {ordering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sipariş Veriliyor...</span>
                      </>
                    ) : (
                      <span>Siparişi Onayla (₺{totals.total.toFixed(2)})</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
