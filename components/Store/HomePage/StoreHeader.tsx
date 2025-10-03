interface StoreHeaderProps {
  message: string;
}

export default function StoreHeader({ message }: StoreHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🛍️ E-Ticaret Mağazası
        </h1>
        <p className="text-lg text-gray-600">
          Binlerce ürün, güvenilir satıcılar, tek platformda!
        </p>
      </div>

      {/* Başarı Mesajı */}
      {message && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {message}
        </div>
      )}
    </>
  );
}
