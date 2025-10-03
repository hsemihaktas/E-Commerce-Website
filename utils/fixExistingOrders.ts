// Mevcut "default-store" siparişlerini gerçek kullanıcı UID'sine güncelleme utility'si
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export const fixExistingOrders = async (realUserId: string) => {
  try {
    console.log("🔧 Fixing existing orders...");

    // "default-store" ile kaydedilmiş siparişleri bul
    const q = query(
      collection(db, "orders"),
      where("storeOwnerId", "==", "default-store")
    );

    const querySnapshot = await getDocs(q);
    let updatedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const orderRef = doc(db, "orders", docSnapshot.id);
      await updateDoc(orderRef, {
        storeOwnerId: realUserId,
      });
      updatedCount++;
      console.log("✅ Updated order:", docSnapshot.id);
    }

    console.log(`🎉 ${updatedCount} orders updated successfully!`);
    return updatedCount;
  } catch (error) {
    console.error("❌ Error fixing orders:", error);
    throw error;
  }
};
