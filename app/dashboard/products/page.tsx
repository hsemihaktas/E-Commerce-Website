"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ProductList from "../../../components/dashboard/ProductList";

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProductList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
