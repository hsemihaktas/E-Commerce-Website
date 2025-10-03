export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  imageUrl?: string;
  userId: string;
  createdAt?: any;
  // Mağaza sahibi bilgileri
  storeOwner?: {
    email: string;
    displayName?: string;
  };
}

export interface Store {
  userId: string;
  email: string;
  displayName?: string;
  products: Product[];
}

export type ViewType = "products" | "stores";
