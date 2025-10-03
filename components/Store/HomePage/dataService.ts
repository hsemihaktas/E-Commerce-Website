import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Product } from "./types";

export const loadAllProducts = async () => {
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

    // Kullanıcı bilgilerini ekle (users collection'ını kontrol et)
    try {
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      console.log("👥 Users collection size:", usersSnapshot.size);

      const usersMap = new Map();
      usersSnapshot.forEach((doc) => {
        usersMap.set(doc.id, doc.data());
      });

      // Ürünlere mağaza sahibi bilgilerini ekle
      const productsWithStore = stockedProducts.map((product) => ({
        ...product,
        storeOwner: usersMap.get(product.userId) || {
          email: "Mağaza Sahibi",
        },
      }));

      return productsWithStore;
    } catch (userError) {
      console.log("⚠️ Users collection bulunamadı, ürünleri yine de göster");
      // Users collection yoksa sadece ürünleri göster
      const productsWithStore = stockedProducts.map((product) => ({
        ...product,
        storeOwner: { email: "Mağaza Sahibi" },
      }));

      return productsWithStore;
    }
  } catch (error) {
    console.error("❌ Ürünler yüklenirken hata:", error);
    throw error;
  }
};
