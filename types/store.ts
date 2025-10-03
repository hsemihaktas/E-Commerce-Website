// Mağaza bilgileri type'ları

export interface StoreSettings {
  id?: string;
  userId: string;
  storeName: string;
  description: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    city: string;
    website?: string;
  };
  businessInfo: {
    businessType: string;
    taxNumber?: string;
    businessAddress?: string;
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface StoreSettingsForm {
  storeName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  website: string;
  businessType: string;
  taxNumber: string;
  businessAddress: string;
  instagram: string;
  facebook: string;
  twitter: string;
}

export const BUSINESS_TYPES = [
  "Bireysel Satıcı",
  "Limited Şirket",
  "Anonim Şirket",
  "Şahış Şirketi",
  "Kooperatif",
  "Dernek/Vakıf",
  "Diğer",
] as const;
