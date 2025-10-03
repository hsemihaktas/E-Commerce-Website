"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import ProtectedRoute from "../../../components/ProtectedRoute";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import {
  StoreSettings,
  StoreSettingsForm,
  BUSINESS_TYPES,
} from "../../../types/store";
import {
  getStoreSettings,
  saveStoreSettings,
  checkStoreNameAvailability,
  deleteStore,
} from "../../../services/storeService";
import AlertModal from "../../../components/ui/AlertModal";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [formData, setFormData] = useState<StoreSettingsForm>({
    storeName: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    website: "",
    businessType: "Bireysel Satıcı",
    taxNumber: "",
    businessAddress: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });
  const [errors, setErrors] = useState<Partial<StoreSettingsForm>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (user?.uid) {
      loadSettings();
    }
  }, [user?.uid]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const storeSettings = await getStoreSettings(user!.uid);
      setSettings(storeSettings);

      if (storeSettings) {
        setFormData({
          storeName: storeSettings.storeName || "",
          description: storeSettings.description || "",
          email: storeSettings.contactInfo?.email || "",
          phone: storeSettings.contactInfo?.phone || "",
          address: storeSettings.contactInfo?.address || "",
          city: storeSettings.contactInfo?.city || "",
          website: storeSettings.contactInfo?.website || "",
          businessType:
            storeSettings.businessInfo?.businessType || "Bireysel Satıcı",
          taxNumber: storeSettings.businessInfo?.taxNumber || "",
          businessAddress: storeSettings.businessInfo?.businessAddress || "",
          instagram: storeSettings.socialMedia?.instagram || "",
          facebook: storeSettings.socialMedia?.facebook || "",
          twitter: storeSettings.socialMedia?.twitter || "",
        });
      } else {
        // Mağaza ayarları yoksa boş form
        setFormData({
          storeName: "",
          description: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          website: "",
          businessType: "Bireysel Satıcı",
          taxNumber: "",
          businessAddress: "",
          instagram: "",
          facebook: "",
          twitter: "",
        });
      }
    } catch (error) {
      console.error("Ayarlar yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof StoreSettingsForm]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StoreSettingsForm> = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = "Mağaza ismi zorunludur";
    } else if (formData.storeName.length < 2) {
      newErrors.storeName = "Mağaza ismi en az 2 karakter olmalıdır";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mağaza açıklaması zorunludur";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    if (formData.phone && !/^[0-9\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Geçerli bir telefon numarası giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Mağaza isminin uygunluğunu kontrol et
      if (formData.storeName !== settings?.storeName) {
        const isAvailable = await checkStoreNameAvailability(
          formData.storeName,
          user!.uid
        );
        if (!isAvailable) {
          setErrors({ storeName: "Bu mağaza ismi zaten kullanılıyor" });
          return;
        }
      }

      const updatedSettings: StoreSettings = {
        userId: user!.uid,
        storeName: formData.storeName,
        description: formData.description,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          website: formData.website,
        },
        businessInfo: {
          businessType: formData.businessType,
          taxNumber: formData.taxNumber,
          businessAddress: formData.businessAddress,
        },
        socialMedia: {
          instagram: formData.instagram,
          facebook: formData.facebook,
          twitter: formData.twitter,
        },
        isActive: true,
      };

      await saveStoreSettings(user!.uid, updatedSettings);

      // Başarılı kayıt sonrası alert göster
      setAlertConfig({
        type: "success",
        title: "Başarılı",
        message: "Mağaza ayarları başarıyla kaydedildi!",
      });
      setShowAlertModal(true);

      // Ayarları yeniden yükle
      await loadSettings();
    } catch (error) {
      console.error("Ayarları kaydetme hatası:", error);
      setAlertConfig({
        type: "error",
        title: "Hata",
        message:
          "Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
      setShowAlertModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStore = async () => {
    try {
      setDeleting(true);
      await deleteStore(user!.uid);

      setAlertConfig({
        type: "success",
        title: "Mağaza Silindi",
        message:
          "Mağazanız ve tüm verileri başarıyla silindi. Anasayfaya yönlendiriliyorsunuz...",
      });
      setShowAlertModal(true);

      // 2 saniye sonra anasayfaya yönlendir
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: unknown) {
      setAlertConfig({
        type: "error",
        title: "Silme Hatası",
        message: error instanceof Error ? error.message : "Mağaza silinirken bir hata oluştu.",
      });
      setShowAlertModal(true);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Mağaza Ayarları
            </h1>
            <p className="mt-2 text-gray-600">
              Mağazanızın bilgilerini ve ayarlarını buradan yönetebilirsiniz.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Temel Bilgiler */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Temel Bilgiler
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="storeName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mağaza İsmi *
                    </label>
                    <input
                      type="text"
                      id="storeName"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.storeName ? "border-red-300" : ""
                      }`}
                      placeholder="Örn: Ahmet'in Mağazası"
                    />
                    {errors.storeName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.storeName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="businessType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      İşletme Türü
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {BUSINESS_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mağaza Açıklaması *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.description ? "border-red-300" : ""
                    }`}
                    placeholder="Mağazanız hakkında kısa bir açıklama yazın..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  İletişim Bilgileri
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.email ? "border-red-300" : ""
                      }`}
                      placeholder="ornek@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.phone ? "border-red-300" : ""
                      }`}
                      placeholder="0555 123 45 67"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Adres
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Mahalle, Sokak, No"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Şehir
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="İstanbul"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://www.ornek.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* İşletme Bilgileri */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  İşletme Bilgileri
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Fatura ve yasal işlemler için gerekli bilgiler
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="taxNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Vergi Numarası
                    </label>
                    <input
                      type="text"
                      id="taxNumber"
                      name="taxNumber"
                      value={formData.taxNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="12345678901"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="businessAddress"
                      className="block text-sm font-medium text-gray-700"
                    >
                      İşletme Adresi
                    </label>
                    <input
                      type="text"
                      id="businessAddress"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="İşletmenizin kayıtlı adresi"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Sosyal Medya
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Sosyal medya hesaplarınızın linklerini ekleyebilirsiniz
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="instagram"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://instagram.com/kullanici_adi"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="facebook"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://facebook.com/sayfa_adi"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="twitter"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Twitter
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://twitter.com/kullanici_adi"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  "Ayarları Kaydet"
                )}
              </button>
            </div>
          </form>

          {/* Tehlikeli İşlemler */}
          <div className="bg-white shadow rounded-lg border border-red-200">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <h3 className="text-lg font-medium text-red-900">
                Tehlikeli İşlemler
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Bu işlemler geri alınamaz. Dikkatli olun!
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-900">
                    Mağazayı Sil
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Mağazanızı kalıcı olarak silin. Bu işlem mağazanız, tüm
                    ürünleriniz, siparişleriniz ve diğer verilerinizi tamamen
                    silecektir.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="ml-6 bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Siliniyor..." : "Mağazayı Sil"}
                </button>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Mağazayı Sil
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bu işlem geri alınamaz. Mağazanız, tüm ürünleriniz,
                        siparişleriniz ve diğer verileriniz kalıcı olarak
                        silinecektir.
                      </p>
                      <p className="text-sm font-medium text-red-600 mt-2">
                        Bu işlemi gerçekten yapmak istiyor musunuz?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleDeleteStore}
                    disabled={deleting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Siliniyor...
                      </>
                    ) : (
                      "Evet, Sil"
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Alert Modal */}
          <AlertModal
            isOpen={showAlertModal}
            onClose={() => setShowAlertModal(false)}
            type={alertConfig.type}
            title={alertConfig.title}
            message={alertConfig.message}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
