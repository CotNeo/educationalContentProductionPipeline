/**
 * İçerik üretim servisi
 * LLM kullanarak iki dilli içerik üretir
 */

import { callOllama, parseJsonResponse } from "./llmClient.js";
import { buildSingleLanguagePrompt } from "./prompts.js";
import { logger } from "../../core/logger.js";
import { withTimeout } from "../../core/utils.js";
import { appConfig } from "../../config/appConfig.js";

const MODULE_NAME = "ContentService";

/**
 * Tek dil için içerik üretir
 * @param {string} topic - Konu başlığı
 * @param {string} lang - Dil kodu (tr veya en)
 * @returns {Promise<Object>} - İçerik objesi
 */
const generateSingleLanguageContent = async (topic, lang) => {
  logger.groupStart(MODULE_NAME, `${lang.toUpperCase()} İçerik Üretimi: "${topic}"`);

  try {
    // 1. Prompt oluştur
    logger.info(MODULE_NAME, `${lang.toUpperCase()} prompt oluşturuluyor`);
    const prompt = buildSingleLanguagePrompt(topic, lang);
    logger.debug(MODULE_NAME, "Prompt hazır", { promptLength: prompt.length });

    // 2. LLM'ye istek gönder
    logger.info(MODULE_NAME, `${lang.toUpperCase()} LLM'ye istek gönderiliyor...`);
    const startTime = Date.now();
    
    const rawResponse = await withTimeout(
      callOllama({ prompt }),
      appConfig.llm.timeout,
      `${lang.toUpperCase()} LLM yanıt verme süresi aşıldı`
    );

    const elapsedTime = Date.now() - startTime;
    logger.success(MODULE_NAME, `${lang.toUpperCase()} LLM yanıtı alındı (${(elapsedTime / 1000).toFixed(1)}s)`);

    // 3. JSON parse et
    logger.info(MODULE_NAME, `${lang.toUpperCase()} yanıt parse ediliyor`);
    logger.debug(MODULE_NAME, "Ham yanıt (ilk 500 karakter)", {
      preview: rawResponse.substring(0, 500),
    });
    const content = await parseJsonResponse(rawResponse);

    // 4. İçeriği doğrula
    validateSingleLanguageContent(content, lang);

    logger.success(MODULE_NAME, `${lang.toUpperCase()} içerik başarıyla üretildi`);
    logger.groupEnd(MODULE_NAME, `${lang.toUpperCase()} İçerik Üretimi: "${topic}"`);

    return content;
  } catch (error) {
    logger.error(MODULE_NAME, `${lang.toUpperCase()} içerik üretimi başarısız`, error);
    logger.groupEnd(MODULE_NAME, `${lang.toUpperCase()} İçerik Üretimi: "${topic}"`);
    throw error;
  }
};

/**
 * İki dilli içerik üretir (TR + EN) - Ayrı çağrılar ile
 * @param {string} topic - Konu başlığı
 * @returns {Promise<Object>} - İki dilli içerik objesi
 */
export const generateBilingualContent = async (topic) => {
  logger.groupStart(MODULE_NAME, `İçerik Üretimi: "${topic}"`);

  try {
    // TR ve EN için sıralı çağrılar yap (Ollama'yı aşırı yüklememek için)
    logger.info(MODULE_NAME, "TR ve EN için sıralı çağrılar başlatılıyor...");
    
    // Önce TR içeriği üret
    logger.info(MODULE_NAME, "TR içeriği üretiliyor...");
    const trContent = await generateSingleLanguageContent(topic, "tr");
    
    // Sonra EN içeriği üret
    logger.info(MODULE_NAME, "EN içeriği üretiliyor...");
    const enContent = await generateSingleLanguageContent(topic, "en");

    const result = {
      tr: trContent,
      en: enContent,
    };

    logger.success(MODULE_NAME, "İki dilli içerik başarıyla üretildi");
    logger.groupEnd(MODULE_NAME, `İçerik Üretimi: "${topic}"`);

    return result;
  } catch (error) {
    logger.error(MODULE_NAME, "İçerik üretimi başarısız", error);
    logger.groupEnd(MODULE_NAME, `İçerik Üretimi: "${topic}"`);
    throw error;
  }
};

/**
 * Tek dil içeriğini doğrular
 * @param {Object} content - Üretilen içerik
 * @param {string} lang - Dil kodu
 */
const validateSingleLanguageContent = (content, lang) => {
  logger.debug(MODULE_NAME, `${lang.toUpperCase()} içerik doğrulanıyor`);

  const requiredFields = [
    "mediumArticle",
    "storyboard",
    "voiceoverText",
    "thumbnailText",
  ];

  for (const field of requiredFields) {
    // Alan var mı kontrol et
    if (content[field] === undefined || content[field] === null) {
      throw new Error(`İçerikte '${field}' alanı bulunamadı veya null`);
    }

    // String mi kontrol et
    if (typeof content[field] !== "string") {
      throw new Error(
        `İçerikte '${field}' alanı string değil, tip: ${typeof content[field]}`
      );
    }

    // Boş string kontrolü
    const trimmedValue = content[field].trim();
    if (trimmedValue.length === 0) {
      throw new Error(
        `İçerikte '${field}' alanı boş. Lütfen bu alanı doldurun.`
      );
    }

    // Minimum uzunluk kontrolü (thumbnailText hariç)
    if (field === "mediumArticle" && trimmedValue.length < 300) {
      logger.info(
        MODULE_NAME,
        `${lang.toUpperCase()} mediumArticle çok kısa (${trimmedValue.length} karakter), 800-1000 kelime bekleniyor`
      );
    }
  }

  logger.debug(MODULE_NAME, `${lang.toUpperCase()} içerik doğrulaması başarılı`);
};

