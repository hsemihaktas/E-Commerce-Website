// Kategori çeviri yardımcıları

export const categoryTranslations: Record<string, string> = {
  elektronik: "Elektronik",
  moda: "Moda & Giyim", 
  ev: "Ev & Yaşam",
  spor: "Spor & Outdoor",
  saglik: "Sağlık & Kozmetik",
  kitap: "Kitap & Medya",
  oyuncak: "Oyuncak & Hobi",
  otomotiv: "Otomotiv",
  diger: "Diğer",
  aksesuar: "Aksesuar",
  ayakkabi: "Ayakkabı",
  canta: "Çanta",
  mutfak: "Mutfak",
  bahce: "Bahçe",
  teknoloji: "Teknoloji"
};

export const getCategoryDisplayName = (categoryKey: string): string => {
  return categoryTranslations[categoryKey] || categoryKey;
};

export const matchesSearchInCategory = (category: string, searchTerm: string): boolean => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  const categoryLower = category.toLowerCase();
  const displayName = getCategoryDisplayName(category).toLowerCase();
  
  return categoryLower.includes(lowerSearchTerm) || 
         displayName.includes(lowerSearchTerm);
};