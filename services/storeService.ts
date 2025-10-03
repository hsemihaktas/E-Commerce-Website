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
