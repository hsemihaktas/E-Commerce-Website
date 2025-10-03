import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { StoreSettings } from "../types/store";

// Kullanıcının mağaza ayarlarını getir
export const getStoreSettings = async (
  userId: string
): Promise<StoreSettings | null> => {
  try {
    const settingsRef = doc(db, "storeSettings", userId);
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      return {
        id: settingsDoc.id,
        ...settingsDoc.data(),
      } as StoreSettings;
    }

    // Mağaza ayarları yoksa null döndür (default oluşturma)
    return null;
  } catch (error) {
    console.error("Mağaza ayarları getirme hatası:", error);
    throw error;
  }
};

// Mağaza ayarlarını güncelle
export const updateStoreSettings = async (
  userId: string,
  settings: Partial<StoreSettings>
): Promise<void> => {
  try {
    const settingsRef = doc(db, "storeSettings", userId);

    const updateData = {
      ...settings,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(settingsRef, updateData);
  } catch (error) {
    console.error("Mağaza ayarları güncelleme hatası:", error);
    throw error;
  }
};

// Mağaza ayarlarını tamamen yeniden kaydet
export const saveStoreSettings = async (
  userId: string,
  settings: StoreSettings
): Promise<void> => {
  try {
    const settingsRef = doc(db, "storeSettings", userId);

    const saveData = {
      ...settings,
      userId,
      updatedAt: serverTimestamp(),
    };

    await setDoc(settingsRef, saveData, { merge: true });
  } catch (error) {
    console.error("Mağaza ayarları kaydetme hatası:", error);
    throw error;
  }
};

// Mağaza ismini kontrol et (benzersizlik için)
export const checkStoreNameAvailability = async (
  storeName: string,
  currentUserId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, "storeSettings"),
      where("storeName", "==", storeName)
    );

    const querySnapshot = await getDocs(q);

    // Eğer sonuç yoksa kullanılabilir
    if (querySnapshot.empty) {
      return true;
    }

    // Eğer tek sonuç var ve o da kullanıcının kendisiyse kullanılabilir
    if (querySnapshot.size === 1) {
      const doc = querySnapshot.docs[0];
      return doc.data().userId === currentUserId;
    }

    // Birden fazla sonuç varsa kullanılamaz
    return false;
  } catch (error) {
    console.error("Mağaza ismi kontrol hatası:", error);
    return false;
  }
};

// Yeni mağaza oluştur
export const createStore = async (
  userId: string,
  storeData: {
    storeName: string;
    description: string;
    category: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    website?: string;
    businessType?: string;
    taxNumber?: string;
    businessAddress?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  }
): Promise<void> => {
  try {
    // Mağaza isminin kullanılabilir olup olmadığını kontrol et
    const isAvailable = await checkStoreNameAvailability(
      storeData.storeName,
      userId
    );
    if (!isAvailable) {
      throw new Error(
        "Bu mağaza ismi zaten kullanılıyor. Lütfen farklı bir isim seçin."
      );
    }

    const settingsRef = doc(db, "storeSettings", userId);

    const newStoreData: StoreSettings = {
      id: userId,
      userId,
      storeName: storeData.storeName,
      description: storeData.description,
      contactInfo: {
        email: storeData.email || "",
        phone: storeData.phone || "",
        address: storeData.address || "",
        city: storeData.city || "",
        website: storeData.website || "",
      },
      businessInfo: {
        businessType: storeData.businessType || "Bireysel Satıcı",
        taxNumber: storeData.taxNumber || "",
        businessAddress: storeData.businessAddress || "",
      },
      socialMedia: {
        instagram: storeData.instagram || "",
        facebook: storeData.facebook || "",
        twitter: storeData.twitter || "",
      },
      isActive: true,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    await setDoc(settingsRef, newStoreData);
  } catch (error) {
    console.error("Mağaza oluşturma hatası:", error);
    throw error;
  }
};

// Mağazayı ve ilgili tüm verileri sil
export const deleteStore = async (userId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // 1. Mağaza ayarlarını sil
    const storeSettingsRef = doc(db, "storeSettings", userId);
    batch.delete(storeSettingsRef);

    // 2. Mağazanın ürünlerini sil
    const productsQuery = query(
      collection(db, "products"),
      where("storeId", "==", userId)
    );
    const productsSnapshot = await getDocs(productsQuery);

    productsSnapshot.forEach((productDoc) => {
      batch.delete(productDoc.ref);
    });

    // 3. Mağazanın siparişlerini sil
    const ordersQuery = query(
      collection(db, "orders"),
      where("storeId", "==", userId)
    );
    const ordersSnapshot = await getDocs(ordersQuery);

    ordersSnapshot.forEach((orderDoc) => {
      batch.delete(orderDoc.ref);
    });

    // 4. Batch işlemini gerçekleştir
    await batch.commit();

    console.log("✅ Mağaza ve tüm ilgili veriler başarıyla silindi");
  } catch (error) {
    console.error("❌ Mağaza silme hatası:", error);
    throw new Error(
      "Mağaza silinirken bir hata oluştu. Lütfen tekrar deneyin."
    );
  }
};
