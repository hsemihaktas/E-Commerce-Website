// Sipariş veri yapısı ve interface'ler

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt?: any;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id?: string;
  orderNumber: string; // Örnek: ORD-2025-001
  storeOwnerId: string; // Mağaza sahibinin user ID'si

  // Müşteri bilgileri
  customer: Customer;

  // Sipariş detayları
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;

  // Durum bilgileri
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "cash" | "card" | "transfer" | "online";

  // Tarih bilgileri
  createdAt: any;
  updatedAt: any;
  shippedAt?: any;
  deliveredAt?: any;

  // Notlar
  customerNotes?: string;
  internalNotes?: string;

  // Kargo bilgileri
  tracking?: {
    company: string;
    trackingNumber: string;
    url?: string;
  };
}

// Sipariş durumları için Türkçe etiketler
export const ORDER_STATUS_LABELS = {
  pending: "Beklemede",
  confirmed: "Onaylandı",
  preparing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
};

export const PAYMENT_STATUS_LABELS = {
  pending: "Ödeme Bekliyor",
  paid: "Ödendi",
  failed: "Ödeme Başarısız",
  refunded: "İade Edildi",
};
