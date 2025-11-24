/**
 * TTS Servisi
 * Ses sentezi işlemlerini yönetir
 */

import { runTTS } from "./ttsClient.js";
import { getVoiceProfile, isLanguageSupported } from "./voiceProfiles.js";
import { logger } from "../../core/logger.js";
import { fileExists } from "../../core/utils.js";
import { appConfig } from "../../config/appConfig.js";

const MODULE_NAME = "TTSService";

/**
 * Ses sentezi yapar
 * @param {Object} params - Parametreler
 * @param {string} params.text - Seslendirilecek metin
 * @param {string} params.lang - Dil kodu (tr/en)
 * @param {string} params.voiceId - Ses profili ID'si
 * @param {string} params.topicSlug - Konu slug'ı (dosya adı için)
 * @returns {Promise<string>} - Oluşturulan ses dosyası yolu
 */
export const synthesizeVoice = async ({ text, lang, voiceId, topicSlug }) => {
  logger.groupStart(MODULE_NAME, `Ses Sentezi: ${lang.toUpperCase()}`);

  try {
    // 1. Ses profilini kontrol et
    logger.info(MODULE_NAME, "Ses profili kontrol ediliyor", { voiceId });
    const voiceProfile = getVoiceProfile(voiceId);

    // 2. Dil desteğini kontrol et
    if (!isLanguageSupported(voiceId, lang)) {
      throw new Error(
        `Ses profili '${voiceId}' ${lang} dilini desteklemiyor. Desteklenen diller: ${voiceProfile.supportedLangs.join(", ")}`
      );
    }

    // 3. Ses örneği dosyasının var olduğunu kontrol et
    logger.info(MODULE_NAME, "Ses örneği dosyası kontrol ediliyor", {
      samplePath: voiceProfile.samplePath,
    });
    const sampleExists = await fileExists(voiceProfile.samplePath);
    if (!sampleExists) {
      throw new Error(
        `Ses örneği dosyası bulunamadı: ${voiceProfile.samplePath}\nLütfen ses örneğini bu konuma yerleştirin.`
      );
    }

    // 4. Çıktı dosya yolunu oluştur
    const outputPath = `runtime/output/audio/${topicSlug}-${lang}.wav`;
    logger.info(MODULE_NAME, "Çıktı yolu belirlendi", { outputPath });

    // 5. Metni temizle (TTS için optimize et)
    const cleanedText = cleanTextForTTS(text);
    logger.debug(MODULE_NAME, "Metin temizlendi", {
      originalLength: text.length,
      cleanedLength: cleanedText.length,
    });

    // 6. TTS işlemini başlat
    logger.info(MODULE_NAME, "TTS işlemi başlatılıyor...");
    const startTime = Date.now();
    
    await runTTS({
      text: cleanedText,
      outputPath,
      lang,
    });

    const elapsedTime = Date.now() - startTime;
    logger.success(
      MODULE_NAME,
      `Ses sentezi tamamlandı (${(elapsedTime / 1000).toFixed(1)}s)`,
      { outputPath }
    );

    // 7. Dosyanın oluşturulduğunu doğrula
    const fileCreated = await fileExists(outputPath);
    if (!fileCreated) {
      throw new Error(`Ses dosyası oluşturulamadı: ${outputPath}`);
    }

    logger.groupEnd(MODULE_NAME, `Ses Sentezi: ${lang.toUpperCase()}`);
    return outputPath;
  } catch (error) {
    logger.error(MODULE_NAME, "Ses sentezi başarısız", error);
    logger.groupEnd(MODULE_NAME, `Ses Sentezi: ${lang.toUpperCase()}`);
    throw error;
  }
};

/**
 * Metni TTS için temizler
 * @param {string} text - Ham metin
 * @returns {string} - Temizlenmiş metin
 */
const cleanTextForTTS = (text) => {
  if (!text) return "";

  return text
    .trim()
    // Çoklu boşlukları tek boşluğa çevir
    .replace(/\s+/g, " ")
    // Özel karakterleri temizle (bazı TTS motorları için)
    .replace(/[^\w\s.,!?;:()\-'"]/g, "")
    // Noktalama işaretlerini koru ama optimize et
    .replace(/\.{2,}/g, ".")
    .replace(/!{2,}/g, "!")
    .replace(/\?{2,}/g, "?");
};

