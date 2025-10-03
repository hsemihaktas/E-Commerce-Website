import React from "react";

interface FirebaseIndexNoticeProps {
  indexUrl: string;
  onDismiss: () => void;
  visible: boolean;
}

export default function FirebaseIndexNotice({
  indexUrl,
  onDismiss,
  visible,
}: FirebaseIndexNoticeProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">
            Firebase Index Gerekli
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Daha iyi performans için Firebase Console'dan index oluşturun.
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => window.open(indexUrl, "_blank")}
              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
            >
              Index Oluştur
            </button>
            <button
              onClick={onDismiss}
              className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
