import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Order, OrderItem, Customer } from "../types/order";

// Sipariş numarası oluşturucu
export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `ORD-${year}${month}${day}-${random}`;
};

// Yeni sipariş oluştur
export const createOrder = async (
  storeOwnerId: string,
  customer: Customer,
  items: OrderItem[],
  paymentMethod: Order["paymentMethod"] = "cash"
): Promise<string> => {
  try {
    // Toplam hesapla
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = subtotal > 100 ? 0 : 15; // 100 TL üzeri kargo bedava
    const tax = subtotal * 0.18; // KDV %18
    const total = subtotal + shipping + tax;

    const orderData: Order = {
      orderNumber: generateOrderNumber(),
      storeOwnerId,
      customer,
      items,
      subtotal,
      shipping,
      tax,
      total,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Transaction ile sipariş oluştur ve stok güncelle
    const orderId = await runTransaction(db, async (transaction) => {
      // ÖNce TÜM OKUMALARI yap
      const productDocs: { [productId: string]: any } = {};

      for (const item of items) {
        const productRef = doc(db, "products", item.productId);
        const productDoc = await transaction.get(productRef);

        // Test ürünleri için kontrol atla
        if (item.productId.startsWith("test-")) {
          continue;
        }

        if (!productDoc.exists()) {
          throw new Error(`Ürün bulunamadı: ${item.productName}`);
        }

        const productData = productDoc.data();
        const currentStock = productData.stock || 0;

        if (currentStock < item.quantity) {
          throw new Error(
            `Yetersiz stok: ${item.productName} (Mevcut: ${currentStock}, İstenen: ${item.quantity})`
          );
        }

        // Ürün verisini sakla
        productDocs[item.productId] = {
          ref: productRef,
          data: productData,
        };
      }

      // SONRA TÜM YAZMALARI yap
      // 1. Sipariş oluştur
      const orderRef = doc(collection(db, "orders"));
      transaction.set(orderRef, orderData);

      // 2. Stokları güncelle
      for (const item of items) {
        // Test ürünleri için stok güncellemesi yapma
        if (item.productId.startsWith("test-")) {
          continue;
        }

        const productInfo = productDocs[item.productId];
        if (productInfo) {
          transaction.update(productInfo.ref, {
            stock: (productInfo.data?.stock || 0) - item.quantity,
            updatedAt: serverTimestamp(),
          });
        }
      }

      return orderRef.id;
    });

    return orderId;
  } catch (error) {
    console.error("Sipariş oluşturma hatası:", error);
    throw error;
  }
};

// Mağaza sahibinin siparişlerini getir
export const getStoreOrders = async (
  storeOwnerId: string
): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, "orders"),
      where("storeOwnerId", "==", storeOwnerId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const orderData = {
        id: doc.id,
        ...doc.data(),
      } as Order;

      orders.push(orderData);
    });

    return orders;
  } catch (error) {
    console.error("❌ Siparişler getirme hatası:", error);
    throw error;
  }
};

// Kullanıcının müşteri olarak verdiği siparişleri getir (customer.email ile)
export const getUserOrders = async (userEmail: string): Promise<Order[]> => {
  try {
    // İlk önce sadece email filtresi ile al (index gerekmez)
    const q = query(
      collection(db, "orders"),
      where("customer.email", "==", userEmail)
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      } as Order);
    });

    // Client-side'da tarihe göre sırala
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime(); // Desc sıralama
    });

    return orders;
  } catch (error) {
    console.error("Kullanıcı siparişleri getirme hatası:", error);
    throw error;
  }
};

// Sipariş durumu güncelle
export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
  trackingInfo?: Order["tracking"]
): Promise<void> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === "shipped") {
      updateData.shippedAt = serverTimestamp();
      if (trackingInfo) {
        updateData.tracking = trackingInfo;
      }
    } else if (status === "delivered") {
      updateData.deliveredAt = serverTimestamp();
    }

    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error("Sipariş durumu güncelleme hatası:", error);
    throw error;
  }
};

// Ödeme durumu güncelle
export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: Order["paymentStatus"]
): Promise<void> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      paymentStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Ödeme durumu güncelleme hatası:", error);
    throw error;
  }
};

// Sipariş iptal et (stokları geri ver)
export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      // ÖNce TÜM OKUMALARI yap
      // 1. Siparişi getir
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists()) {
        throw new Error("Sipariş bulunamadı");
      }

      const orderData = orderDoc.data() as Order;

      if (orderData.status === "cancelled") {
        throw new Error("Sipariş zaten iptal edilmiş");
      }

      if (orderData.status === "delivered") {
        throw new Error("Teslim edilmiş sipariş iptal edilemez");
      }

      // 2. Ürünleri oku
      const productDocs: { [productId: string]: any } = {};
      for (const item of orderData.items) {
        const productRef = doc(db, "products", item.productId);
        const productDoc = await transaction.get(productRef);

        if (productDoc.exists()) {
          productDocs[item.productId] = {
            ref: productRef,
            data: productDoc.data(),
          };
        }
      }

      // SONRA TÜM YAZMALARI yap
      // 1. Sipariş durumunu güncelle
      transaction.update(orderRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });

      // 2. Stokları geri ver
      for (const item of orderData.items) {
        const productInfo = productDocs[item.productId];
        if (productInfo) {
          transaction.update(productInfo.ref, {
            stock: (productInfo.data?.stock || 0) + item.quantity,
            updatedAt: serverTimestamp(),
          });
        }
      }
    });
  } catch (error) {
    console.error("Sipariş iptal etme hatası:", error);
    throw error;
  }
};
