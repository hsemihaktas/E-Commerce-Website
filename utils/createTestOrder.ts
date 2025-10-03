// Test siparişi oluşturmak için utility fonksiyonu
import { createOrder } from "../services/orderService";
import { Customer, OrderItem } from "../types/order";

export const createTestOrder = async (storeOwnerId: string) => {
  try {
    const testCustomer: Customer = {
      name: "Ahmet Yılmaz",
      email: "ahmet@test.com",
      phone: "05551234567",
      address: {
        street: "Test Sokak No:123",
        city: "İstanbul",
        postalCode: "34000",
        country: "Türkiye",
      },
    };

    const testItems: OrderItem[] = [
      {
        productId: "test-product-1",
        productName: "Test Ürün 1",
        productPrice: 50.0,
        quantity: 2,
        totalPrice: 100.0,
      },
      {
        productId: "test-product-2",
        productName: "Test Ürün 2",
        productPrice: 75.5,
        quantity: 1,
        totalPrice: 75.5,
      },
    ];

    console.log("🛒 Creating test order for store:", storeOwnerId);

    const orderId = await createOrder(
      storeOwnerId,
      testCustomer,
      testItems,
      "cash"
    );

    console.log("✅ Test order created with ID:", orderId);
    return orderId;
  } catch (error) {
    console.error("❌ Test sipariş oluşturma hatası:", error);
    throw error;
  }
};
