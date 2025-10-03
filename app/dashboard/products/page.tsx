"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { getStoreSettings } from "../../../services/storeService";
import ProtectedRoute from "../../../components/ProtectedRoute";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ProductList from "../../../components/dashboard/ProductList";

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.uid) {
      checkStoreSettings();
    }
  }, [user?.uid]);

  const checkStoreSettings = async () => {
    try {
      const settings = await getStoreSettings(user!.uid);
      if (!settings || !settings.storeName || !settings.description) {
        router.push("/dashboard/settings");
      }
    } catch (error) {
      router.push("/dashboard/settings");
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProductList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
