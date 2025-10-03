"use client";

import { useState, useEffect, use } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { createOrder } from "../../../services/orderService";
import { Customer, OrderItem } from "../../../types/order";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  imageUrl?: string;
  userId: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function StorePage({ params }: { params: Promise<{ storeId: string }> }) {
  const resolvedParams = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

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
    loadProducts();
  }, [resolvedParams.storeId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "products"),
        where("userId", "==", resolvedParams.storeId)
      );

      const querySnapshot = await getDocs(q);
      const productsData: Product[] = [];

      querySnapshot.forEach((doc) => {
        productsData.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });

      setProducts(productsData);
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          alert("Stok miktarını aştınız!");
          return prevCart;
        }

        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.stock === 0) {
          alert("Bu ürün stokta yok!");
          return prevCart;
        }

        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const maxQuantity =
            products.find((p) => p.id === productId)?.stock || 0;
          return {
            ...item,
            quantity: Math.min(quantity, maxQuantity),
          };
        }
        return item;
      })
    );
  };

  const getTotalPrice = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = subtotal * 0.18;
    return {
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
    };
  };

  const handleCheckout = async () => {
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

      // Sipariş kalemlerini hazırla
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        productPrice: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
      }));

      // Siparişi oluştur
      const orderId = await createOrder(
        resolvedParams.storeId,
        customerInfo,
        orderItems,
        "cash" // Default olarak kapıda ödeme
      );

      alert(`Siparişiniz başarıyla oluşturuldu! Sipariş No: ${orderId}`);

      // Formu temizle
      setCart([]);
      setShowCheckout(false);
      setCustomerInfo({
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

      // Ürünleri tekrar yükle (stok güncellenmiş olabilir)
      loadProducts();
    } catch (error: any) {
      console.error("Sipariş oluşturma hatası:", error);
      alert(error.message || "Sipariş oluşturulurken hata oluştu!");
    }
  };

  const pricing = getTotalPrice();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products Grid */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mağaza</h1>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Bu mağazada henüz ürün bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3">
                      {product.description || "Açıklama bulunmuyor"}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        ₺{product.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          product.stock > 5
                            ? "bg-green-100 text-green-800"
                            : product.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} stok`
                          : "Stok yok"}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={`w-full py-2 px-4 rounded-md font-medium ${
                        product.stock === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {product.stock === 0 ? "Stok Yok" : "Sepete Ekle"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shopping Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Sepetim ({cart.length} ürün)
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sepetiniz boş</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ₺{item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam:</span>
                    <span>₺{pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kargo:</span>
                    <span>₺{pricing.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>KDV:</span>
                    <span>₺{pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Toplam:</span>
                    <span>₺{pricing.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700"
                >
                  Siparişi Tamamla
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Sipariş Bilgileri
              </h2>

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
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Siparişi Onayla (₺{pricing.total.toFixed(2)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
