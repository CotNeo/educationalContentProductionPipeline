/**
 * Ses profilleri
 * Klonlanacak ses örneklerinin tanımları
 */

import { join } from "path";
import { getProjectRoot } from "../../config/paths.js";

const projectRoot = getProjectRoot();

/**
 * Ses profilleri
 */
export const voiceProfiles = {
  "furkan-default": {
    displayName: "Furkan (Ana Ses)",
    samplePath: join(projectRoot, "runtime/voice_samples/furkan.wav"),
    supportedLangs: ["tr", "en"],
    description: "Furkan'ın ana ses profili - Türkçe ve İngilizce destekler",
  },
};

/**
 * Ses profilini ID'ye göre getirir
 * @param {string} voiceId - Ses profili ID'si
 * @returns {Object} - Ses profili objesi
 */
export const getVoiceProfile = (voiceId) => {
  const profile = voiceProfiles[voiceId];
  
  if (!profile) {
    throw new Error(`Ses profili bulunamadı: ${voiceId}`);
  }
  
  return profile;
};

/**
 * Desteklenen dilleri kontrol eder
 * @param {string} voiceId - Ses profili ID'si
 * @param {string} lang - Dil kodu
 * @returns {boolean} - Dil destekleniyor mu?
 */
export const isLanguageSupported = (voiceId, lang) => {
  const profile = getVoiceProfile(voiceId);
  return profile.supportedLangs.includes(lang);
};

