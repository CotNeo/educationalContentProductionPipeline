/**
 * Yardımcı fonksiyonlar
 * Slugify, zaman formatlama, dosya işlemleri vb.
 */

/**
 * String'i URL-friendly slug'a çevirir
 * Örnek: "API nedir?" -> "api-nedir"
 */
export const slugify = (text) => {
  if (!text) return "";
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Türkçe karakterleri değiştir
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    // Özel karakterleri kaldır
    .replace(/[^\w\s-]/g, "")
    // Boşlukları tire ile değiştir
    .replace(/\s+/g, "-")
    // Birden fazla tireyi tek tire yap
    .replace(/-+/g, "-")
    // Başta ve sonda tire varsa kaldır
    .replace(/^-+|-+$/g, "");
};

/**
 * Saniyeyi dakika:saniye formatına çevirir
 * Örnek: 125 -> "2:05"
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Dosya boyutunu okunabilir formata çevirir
 * Örnek: 1024000 -> "1.02 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Metindeki kelime sayısını döndürür
 */
export const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
};

/**
 * Metni belirli uzunlukta keser ve "..." ekler
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Promise için timeout ekler
 */
export const withTimeout = (promise, timeoutMs, errorMessage = "Operation timed out") => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

/**
 * Dosyanın var olup olmadığını kontrol eder
 */
export const fileExists = async (filePath) => {
  try {
    const { access } = await import("fs/promises");
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * İki tarih arasındaki süreyi hesaplar (ms cinsinden)
 */
export const getElapsedTime = (startTime) => {
  return Date.now() - startTime;
};

/**
 * Süreyi okunabilir formata çevirir
 * Örnek: 125000 -> "2 dakika 5 saniye"
 */
export const formatElapsedTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} saat ${minutes % 60} dakika`;
  } else if (minutes > 0) {
    return `${minutes} dakika ${seconds % 60} saniye`;
  } else {
    return `${seconds} saniye`;
  }
};

