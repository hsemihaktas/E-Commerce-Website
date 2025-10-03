# 🛍️ Modern E-Ticaret Platformu

Modern ve kullanıcı dostu bir e-ticaret platformu. Kullanıcılar kendi mağazalarını açabilir, ürün ekleyebilir ve satış yapabilirler.

## 🚀 Demo

**Canlı Demo:** [https://demo-eticaret.vercel.app/](https://demo-eticaret.vercel.app/)

Demo hesabı ile giriş yapabilir veya yeni bir hesap oluşturarak platformu test edebilirsiniz.

## ✨ Özellikler

### 👤 Kullanıcı Yönetimi

- **Güvenli Kimlik Doğrulama**: Firebase Authentication ile email/şifre girişi
- **Hesap Oluşturma**: Hızlı ve kolay kayıt işlemi
- **Profil Yönetimi**: Kullanıcı bilgilerini güncelleme
- **Şifre Sıfırlama**: Email ile şifre sıfırlama

### 🏪 Mağaza Yönetimi

- **Mağaza Oluşturma**: Kolay ve hızlı mağaza kurulum süreci
- **Mağaza Bilgileri**: İsim, açıklama, kategori, iletişim bilgileri
- **Mağaza Ayarları**: Kapsamlı mağaza yönetim paneli
- **Mağaza Silme**: Güvenli mağaza ve veri silme işlemi

### 📦 Ürün Yönetimi

- **Ürün Ekleme**: Detaylı ürün bilgileri ve resim yükleme
- **Ürün Düzenleme**: Mevcut ürünleri güncelleme
- **Stok Takibi**: Gerçek zamanlı stok kontrolü
- **Kategori Yönetimi**: 15+ farklı ürün kategorisi
- **Fiyat Yönetimi**: Esnek fiyatlandırma sistemi

### 🛒 Alışveriş Deneyimi

- **Ürün Kataloğu**: Kategorilere göre ürün browsing
- **Sepet Sistemi**: Gelişmiş sepet yönetimi
- **Sipariş Verme**: Kolay sipariş oluşturma
- **Ürün Arama**: Hızlı ürün arama ve filtreleme
- **Mağaza Sayfası**: Her mağaza için özel vitrin

### 📊 Dashboard ve Raporlama

- **Anlık İstatistikler**: Toplam ürün, stok, sipariş sayıları
- **Finansal Takip**: Kazanılan para ve bekleyen ödemeler
- **Stok Uyarıları**: Az stok ve stok bitti bildirimleri
- **Sipariş Yönetimi**: Sipariş durumu takibi ve güncelleme
- **Grafik Raporlar**: Kategori dağılımı ve trend analizleri
- **Son Aktiviteler**: En son eklenen ürünler ve işlemler

### 🎨 Modern Arayüz

- **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu
- **Modern UI/UX**: Tailwind CSS ile şık tasarım
- **Dark/Light Mode**: Kullanıcı tercihine göre tema
- **Hızlı Yükleme**: Optimize edilmiş performans
- **Kolay Navigasyon**: Kullanıcı dostu menü yapısı

## 🛠️ Teknoloji Yığını

### Frontend

- **Next.js 15.5.4**: React tabanlı fullstack framework
- **TypeScript**: Type-safe geliştirme
- **Tailwind CSS**: Modern ve responsive tasarım
- **React Hooks**: Modern React geliştirme

### Backend & Database

- **Firebase Firestore**: NoSQL veritabanı
- **Firebase Authentication**: Güvenli kimlik doğrulama
- **Firebase Storage**: Dosya ve resim depolama
- **Real-time Updates**: Anlık veri senkronizasyonu

### Development Tools

- **ESLint**: Kod kalitesi kontrolü
- **PostCSS**: CSS işleme ve optimizasyon
- **Vercel**: Deployment ve hosting

## 📱 Kullanım Senaryoları

### Mağaza Sahibi Olarak:

1. **Kayıt Ol** → Yeni hesap oluştur
2. **Mağaza Aç** → Mağaza bilgilerini doldur
3. **Ürün Ekle** → Ürünlerini kataloguna ekle
4. **Dashboard** → Satış ve stok durumunu takip et
5. **Sipariş Yönet** → Gelen siparişleri işle

### Müşteri Olarak:

1. **Ürün Ara** → Kategorilere göz at
2. **Mağaza Ziyaret Et** → İlgini çeken mağazaları keşfet
3. **Sepete Ekle** → Beğendiğin ürünleri sepete at
4. **Sipariş Ver** → Kolay checkout süreci

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

- Node.js 18.17 veya üzeri
- npm, yarn, pnpm veya bun
- Firebase projesi

### Kurulum Adımları

1. **Projeyi klonlayın:**

```bash
git clone https://github.com/hsemihaktas/E-Commerce-Website.git
cd E-Commerce-Website
```

2. **Bağımlılıkları yükleyin:**

```bash
npm install
# veya
yarn install
```

3. **Environment variables'ları ayarlayın:**

```bash
cp .env.example .env.local
```

`.env.local` dosyasında Firebase yapılandırmanızı ekleyin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

NEXT_PUBLIC_API_BASE_URL=your_api_base_url
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

4. **Development server'ı başlatın:**

```bash
npm run dev
# veya
yarn dev
```

5. **Tarayıcınızda açın:**

```
http://localhost:3000
```

## 📂 Proje Yapısı

```
├── app/                     # Next.js App Router
│   ├── auth/               # Kimlik doğrulama sayfaları
│   ├── create-store/       # Mağaza oluşturma
│   ├── dashboard/          # Mağaza yönetim paneli
│   ├── store/             # Mağaza vitrin sayfaları
│   └── globals.css        # Global stiller
├── components/             # Yeniden kullanılabilir bileşenler
│   ├── dashboard/         # Dashboard bileşenleri
│   ├── modals/           # Modal bileşenleri
│   └── common/           # Ortak bileşenler
├── contexts/              # React Context'leri
├── services/             # API ve servis fonksiyonları
├── types/               # TypeScript tip tanımları
└── utils/              # Yardımcı fonksiyonlar
```

## 🔧 Yapılandırma

### Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/) üzerinden yeni proje oluşturun
2. Authentication'ı aktifleştirin (Email/Password)
3. Firestore Database oluşturun
4. Web app ekleyip config değerlerini alın

### Firestore Güvenlik Kuralları

Aşağıdaki kurallar Firestore veritabanınız için önerilmektedir:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users koleksiyonu - sadece kendi verilerini okuyabilir/yazabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Products koleksiyonu - herkes okuyabilir, sadece sahibi yazabilir
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
                   (request.auth.uid == resource.data.userId ||
                    request.auth.uid == request.resource.data.userId);
    }

    // Orders koleksiyonu - önemli kısım bu!
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                  request.auth.token.email == resource.data.customer.email;
      allow create: if request.auth != null &&
                    request.auth.token.email == request.resource.data.customer.email;
      allow update: if request.auth != null &&
                    (request.auth.token.email == resource.data.customer.email ||
                     request.auth.uid == resource.data.storeOwnerId);
    }

    // Diğer koleksiyonlar için genel kural
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment

### Vercel (Önerilen)

1. Projeyi GitHub'a push edin
2. [Vercel](https://vercel.com) hesabınızla GitHub'ı bağlayın
3. Projeyi import edin
4. Environment variables'ları ekleyin
5. Deploy edin

### Manuel Deployment

```bash
npm run build
npm run start
```

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılarız! Lütfen şu adımları takip edin:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 License

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim

- **Geliştirici**: Semih Aktaş
- **GitHub**: [@hsemihaktas](https://github.com/hsemihaktas)
- **Demo**: [https://demo-eticaret.vercel.app/](https://demo-eticaret.vercel.app/)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend servisleri
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Hosting platform
