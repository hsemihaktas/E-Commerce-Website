import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Product } from "./types";

interface LoadProductsResult {
  products: Product[];
  allStores: Map<string, any>;
}

export const loadAllProducts = async (): Promise<LoadProductsResult> => {
  try {
    console.log("🔍 Ürünler yükleniyor...");

    // Önce tüm ürünleri stok filtresi olmadan getir
    const allProductsQuery = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const allProductsSnapshot = await getDocs(allProductsQuery);
    console.log("📦 Toplam ürün sayısı:", allProductsSnapshot.size);

    const allProducts: Product[] = [];

    allProductsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("📦 Ürün:", {
        id: doc.id,
        name: data.name,
        stock: data.stock,
        userId: data.userId,
      });
      allProducts.push({
        id: doc.id,
        ...data,
      } as Product);
    });

    console.log("✅ Yüklenen ürünler:", allProducts.length);

    // Sadece stokta olan ürünleri filtrele (client-side)
    const stockedProducts = allProducts.filter(
      (product) => (product.stock || 0) > 0
    );
    console.log("📦 Stokta olan ürünler:", stockedProducts.length);

    // Kullanıcı ve mağaza bilgilerini ekle
    try {
      // Users collection'ını yükle
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      console.log("👥 Users collection size:", usersSnapshot.size);

      const usersMap = new Map();
      usersSnapshot.forEach((doc) => {
        usersMap.set(doc.id, doc.data());
      });

      // Store settings collection'ını yükle
      const storeSettingsQuery = query(collection(db, "storeSettings"));
      const storeSettingsSnapshot = await getDocs(storeSettingsQuery);
      console.log(
        "🏪 Store settings collection size:",
        storeSettingsSnapshot.size
      );

      const storeSettingsMap = new Map();
      storeSettingsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Hem doc.id hem de data.userId ile map'le (emin olmak için)
        storeSettingsMap.set(doc.id, data);
        if (data.userId && data.userId !== doc.id) {
          storeSettingsMap.set(data.userId, data);
        }
      });

      // Ürünlere mağaza sahibi bilgilerini ekle
      const productsWithStore = stockedProducts.map((product) => {
        // Öncelik storeId'ye, geriye dönük uyumluluk için userId fallback
        const lookupId = product.storeId || product.userId;
        const userInfo = usersMap.get(product.userId || lookupId);
        const storeInfo = storeSettingsMap.get(lookupId);

        return {
          ...product,
          storeId: lookupId || "unknown", // StoreId'yi normalize et, fallback değer
          storeOwner: userInfo || { email: "Mağaza Sahibi" },
          storeSettings: storeInfo
            ? {
                storeName: storeInfo.storeName,
                description: storeInfo.description,
              }
            : null,
        };
      });

      return { products: productsWithStore, allStores: storeSettingsMap };
    } catch (userError) {
      console.log("⚠️ Users collection bulunamadı, ürünleri yine de göster");
      // Users collection yoksa sadece ürünleri göster
      const productsWithStore = stockedProducts.map((product) => ({
        ...product,
        storeOwner: { email: "Mağaza Sahibi" },
      }));

      return { products: productsWithStore, allStores: new Map() };
    }
  } catch (error) {
    console.error("❌ Ürünler yüklenirken hata:", error);
    throw error;
  }
};
