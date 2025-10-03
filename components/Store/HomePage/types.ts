export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  imageUrl?: string;
  storeId: string; // Ana alan
  storeName?: string; // Cache edilmiş mağaza ismi
  userId?: string; // Geriye dönük uyumluluk için opsiyonel
  createdAt?: any;
  // Mağaza sahibi bilgileri
  storeOwner?: {
    email: string;
    displayName?: string;
  };
  // Mağaza ayarları
  storeSettings?: {
    storeName: string;
    description?: string;
  } | null;
}

export interface Store {
  userId: string;
  email: string;
  displayName?: string;
  storeName?: string;
  storeDescription?: string;
  products: Product[];
}

export type ViewType = "products" | "stores";
