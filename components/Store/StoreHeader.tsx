"use client";

import { useState, useEffect } from "react";
import { StoreSettings } from "../../types/store";
import { getStoreSettings } from "../../services/storeService";

interface StoreHeaderProps {
  storeId: string;
}

export default function StoreHeader({ storeId }: StoreHeaderProps) {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreSettings();
  }, [storeId]);

  const loadStoreSettings = async () => {
    try {
      setLoading(true);
      const settings = await getStoreSettings(storeId);
      setStoreSettings(settings);
    } catch (error) {
      console.error("Mağaza ayarları yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!storeSettings) {
    return (
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Mağaza</h1>
          <p className="mt-2 text-gray-600">Mağaza bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {storeSettings.storeName}
            </h1>
            <p className="mt-2 text-gray-600 max-w-3xl">
              {storeSettings.description}
            </p>

            {/* İletişim Bilgileri */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {storeSettings.contactInfo?.email && (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href={`mailto:${storeSettings.contactInfo.email}`}
                    className="hover:text-blue-600"
                  >
                    {storeSettings.contactInfo.email}
                  </a>
                </div>
              )}

              {storeSettings.contactInfo?.phone && (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a
                    href={`tel:${storeSettings.contactInfo.phone}`}
                    className="hover:text-blue-600"
                  >
                    {storeSettings.contactInfo.phone}
                  </a>
                </div>
              )}

              {storeSettings.contactInfo?.city && (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{storeSettings.contactInfo.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sosyal Medya Linkleri */}
          {(storeSettings.socialMedia?.instagram ||
            storeSettings.socialMedia?.facebook ||
            storeSettings.socialMedia?.twitter) && (
            <div className="mt-4 md:mt-0 flex space-x-3">
              {storeSettings.socialMedia?.instagram && (
                <a
                  href={storeSettings.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.748-.948-.748-2.229 0-3.177.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948.748 2.229 0 3.177-.749.948-1.9 1.559-3.197 1.559zm7.718 0c-1.297 0-2.448-.611-3.197-1.559-.748-.948-.748-2.229 0-3.177.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948.748 2.229 0 3.177-.749.948-1.9 1.559-3.197 1.559z" />
                  </svg>
                </a>
              )}

              {storeSettings.socialMedia?.facebook && (
                <a
                  href={storeSettings.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}

              {storeSettings.socialMedia?.twitter && (
                <a
                  href={storeSettings.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Website Linki */}
        {storeSettings.contactInfo?.website && (
          <div className="mt-4">
            <a
              href={storeSettings.contactInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Website'yi Ziyaret Et
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
