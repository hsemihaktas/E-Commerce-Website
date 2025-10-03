"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { createStore, getStoreSettings, checkStoreNameAvailability } from "../../services/storeService";
import AlertModal from "../../components/ui/AlertModal";
import GlobalNavbar from "../../components/layout/GlobalNavbar";

export default function CreateStorePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    category: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });
  const [hasStore, setHasStore] = useState(false);
  const [checkingStore, setCheckingStore] = useState(true);

  // Giriş kontrolü ve mevcut mağaza kontrolü
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth");
        return;
      }
      checkExistingStore();
    }
  }, [user, loading, router]);

  const checkExistingStore = async () => {
    try {
      const settings = await getStoreSettings(user!.uid);
      if (settings && settings.storeName && settings.description) {
        setHasStore(true);
      }
    } catch (error) {
      // Mağaza yok, devam et
    } finally {
      setCheckingStore(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Sadece rakam, boşluk, tire ve parantez karakterlerine izin ver
    value = value.replace(/[^0-9\s\-\(\)]/g, '');
    
    // Türkiye telefon formatına göre otomatik formatlama
    if (value.length <= 11) {
      if (value.startsWith('0')) {
        // 0555 123 45 67 formatı
        if (value.length > 4 && value.length <= 7) {
          value = value.slice(0, 4) + ' ' + value.slice(4);
        } else if (value.length > 7 && value.length <= 9) {
          value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7);
        } else if (value.length > 9) {
          value = value.slice(0, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 9) + ' ' + value.slice(9);
        }
      }
    }
    
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const validateForm = async () => {
    const required = [
      "storeName", "description", "category", "email", "phone", 
      "address", "city", "website", "businessType", "taxNumber", "businessAddress"
    ];
    
    const fieldNames: { [key: string]: string } = {
      storeName: "Mağaza adı",
      description: "Açıklama",
      category: "Kategori",
      email: "E-posta adresi",
      phone: "Telefon",
      address: "Adres",
      city: "Şehir",
      website: "Website",
      businessType: "İş türü",
      taxNumber: "Vergi numarası",
      businessAddress: "İş adresi"
    };
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData].trim()) {
        setAlertConfig({
          type: "error",
          title: "Eksik Bilgi",
          message: `${fieldNames[field]} alanı zorunludur!`,
        });
        setShowAlertModal(true);
        return false;
      }
    }

    // Telefon numarası validasyonu
    const phoneRegex = /^0[5-9]\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setAlertConfig({
        type: "error",
        title: "Geçersiz Telefon",
        message: "Geçerli bir Türkiye telefon numarası giriniz (örn: 0555 123 45 67)",
      });
      setShowAlertModal(true);
      return false;
    }

    // E-posta validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAlertConfig({
        type: "error",
        title: "Geçersiz E-posta",
        message: "Geçerli bir e-posta adresi giriniz",
      });
      setShowAlertModal(true);
      return false;
    }

    // Website URL validasyonu
    const urlRegex = /^https?:\/\/.+\..+/;
    if (formData.website && !urlRegex.test(formData.website)) {
      setAlertConfig({
        type: "error",
        title: "Geçersiz Website",
        message: "Website adresi http:// veya https:// ile başlamalıdır",
      });
      setShowAlertModal(true);
      return false;
    }

    // Mağaza isminin benzersizliğini kontrol et
    try {
      const isAvailable = await checkStoreNameAvailability(formData.storeName, user!.uid);
      if (!isAvailable) {
        setAlertConfig({
          type: "error",
          title: "Mağaza İsmi Kullanılıyor",
          message: "Bu mağaza ismi zaten alınmış. Lütfen farklı bir isim seçin.",
        });
        setShowAlertModal(true);
        return false;
      }
    } catch (error) {
      setAlertConfig({
        type: "error",
        title: "Kontrol Hatası",
        message: "Mağaza ismi kontrol edilirken hata oluştu. Lütfen tekrar deneyin.",
      });
      setShowAlertModal(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await validateForm())) return;

    setIsSubmitting(true);

    try {
      await createStore(user!.uid, formData);

      setAlertConfig({
        type: "success",
        title: "Tebrikler!",
        message:
          "Mağazanız başarıyla oluşturuldu! Dashboard'a yönlendiriliyorsunuz...",
      });
      setShowAlertModal(true);

      // 2 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: unknown) {
      setAlertConfig({
        type: "error",
        title: "Hata",
        message: `Mağaza oluşturulurken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      });
      setShowAlertModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading durumu
  if (loading || checkingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mağaza zaten var
  if (hasStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2-5.5V9a2 2 0 012-2 2 2 0 012 2v7.5M5 21h14"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Mağazanız Hazır!
          </h2>
          <p className="text-gray-600 mb-6">
            Zaten aktif bir mağazanız bulunuyor. Dashboard'dan mağazanızı
            yönetebilirsiniz.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Dashboard'a Git
            </Link>
            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Anasayfa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavbar />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Mağazanızı Oluşturun
            </h2>
            <p className="text-gray-600">
              Birkaç adımda kendi online mağazanızı kurun ve satışa başlayın
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm text-blue-600 font-medium">
                  Mağaza Bilgileri
                </span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm text-gray-500">Dashboard</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mağaza Adı */}
              <div>
                <label
                  htmlFor="storeName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mağaza Adı *
                </label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Örn:                   Ahmet&apos;in Teknoloji Mağazası"
                  required
                />
              </div>

              {/* Açıklama */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mağaza Açıklaması *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Mağazanızı tanıtan kısa bir açıklama yazın..."
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ana Kategori *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Kategori seçin</option>
                  <option value="elektronik">Elektronik</option>
                  <option value="moda">Moda & Giyim</option>
                  <option value="ev">Ev & Yaşam</option>
                  <option value="kitap">Kitap & Kırtasiye</option>
                  <option value="spor">Spor & Outdoor</option>
                  <option value="kozmetik">Kozmetik & Kişisel Bakım</option>
                  <option value="oyuncak">Oyuncak & Hobi</option>
                  <option value="otomotiv">Otomotiv</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Telefon */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0555 123 45 67"
                    maxLength={13}
                    required
                  />
                </div>

                {/* Şehir */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Şehir *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="İstanbul"
                    required
                  />
                </div>
              </div>

              {/* Adres */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Adres *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Mağaza adresiniz"
                  required
                />
              </div>

              {/* İletişim Bilgileri */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  İletişim Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      E-posta Adresi *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="magaza@example.com"
                      required
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Website *
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="https://www.mağazam.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* İş Bilgileri */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  İş Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* İş Türü */}
                  <div>
                    <label
                      htmlFor="businessType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      İş Türü *
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="Bireysel Satıcı">Bireysel Satıcı</option>
                      <option value="Limited Şirket">Limited Şirket</option>
                      <option value="Anonim Şirket">Anonim Şirket</option>
                      <option value="Şahış Şirketi">Şahış Şirketi</option>
                      <option value="Kooperatif">Kooperatif</option>
                      <option value="Dernek/Vakıf">Dernek/Vakıf</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>

                  {/* Vergi Numarası */}
                  <div>
                    <label
                      htmlFor="taxNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Vergi Numarası *
                    </label>
                    <input
                      type="text"
                      id="taxNumber"
                      name="taxNumber"
                      value={formData.taxNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="1234567890"
                      required
                    />
                  </div>
                </div>

                {/* İş Adresi */}
                <div className="mt-6">
                  <label
                    htmlFor="businessAddress"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    İş Adresi *
                  </label>
                  <textarea
                    id="businessAddress"
                    name="businessAddress"
                    rows={3}
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Fatura/vergi adresi"
                    required
                  />
                </div>
              </div>

              {/* Sosyal Medya */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sosyal Medya
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Instagram */}
                  <div>
                    <label
                      htmlFor="instagram"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="https://instagram.com/magaza"
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label
                      htmlFor="facebook"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="https://facebook.com/magaza"
                    />
                  </div>

                  {/* Twitter */}
                  <div>
                    <label
                      htmlFor="twitter"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Twitter
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="https://twitter.com/magaza"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                >
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 text-white py-3 px-6 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Oluşturuluyor...
                    </span>
                  ) : (
                    "Mağazamı Oluştur"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Benefits */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Mağazanızla Neler Yapabilirsiniz?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  Sınırsız ürün ekleyebilirsiniz
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  Siparişlerinizi takip edin
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  Satış istatistiklerinizi görün
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">
                  0% komisyon ilk 30 gün
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Modal */}
        {/* Alert Modal */}
        <AlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
        />
      </div>
    </div>
  );
}
