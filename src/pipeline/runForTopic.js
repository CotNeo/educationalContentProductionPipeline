/**
 * Tek konu için tüm pipeline'ı çalıştırır
 * İçerik üretimi → TTS → Video oluşturma
 */

import { generateBilingualContent } from "../services/llm/contentService.js";
import { synthesizeVoice } from "../services/tts/ttsService.js";
import { createShortVideo } from "../services/video/videoService.js";
import { writeFile } from "fs/promises";
import { logger } from "../core/logger.js";
import { slugify } from "../core/utils.js";
import { getOutputPaths, ensureDirectories } from "../config/paths.js";
import { appConfig } from "../config/appConfig.js";
import { getElapsedTime, formatElapsedTime } from "../core/utils.js";

const MODULE_NAME = "Pipeline";

/**
 * Tek konu için tüm pipeline'ı çalıştırır
 * @param {string} topic - Konu başlığı
 * @returns {Promise<Object>} - Oluşturulan dosya yolları
 */
export const runForTopic = async (topic) => {
  const startTime = Date.now();
  logger.groupStart(MODULE_NAME, `Pipeline Başlatıldı: "${topic}"`);

  try {
    // 1. Dizinleri oluştur
    ensureDirectories();

    // 2. Topic slug'ı oluştur
    const topicSlug = slugify(topic);
    logger.info(MODULE_NAME, "Topic slug oluşturuldu", { topicSlug });

    // 3. İki dilli içerik üret
    logger.info(MODULE_NAME, "İçerik üretimi başlatılıyor...");
    const content = await generateBilingualContent(topic);

    // 4. Her dil için işlemleri yap
    const results = {
      tr: {},
      en: {},
    };

    for (const lang of ["tr", "en"]) {
      logger.groupStart(MODULE_NAME, `${lang.toUpperCase()} İşlemleri`);

      const langContent = content[lang];
      const outputPaths = getOutputPaths(topicSlug, lang);

      // 4.1. Medium makalesini kaydet
      logger.info(MODULE_NAME, "Medium makalesi kaydediliyor...");
      await writeFile(outputPaths.article, langContent.mediumArticle, "utf8");
      results[lang].article = outputPaths.article;
      logger.success(MODULE_NAME, "Medium makalesi kaydedildi", {
        path: outputPaths.article,
      });

      // 4.1.1. Storyboard'u kaydet
      const storyboardPath = outputPaths.article.replace(".md", "-storyboard.md");
      await writeFile(storyboardPath, langContent.storyboard, "utf8");
      results[lang].storyboard = storyboardPath;
      logger.success(MODULE_NAME, "Storyboard kaydedildi", {
        path: storyboardPath,
      });

      // 4.2. Ses sentezi yap
      logger.info(MODULE_NAME, "Ses sentezi başlatılıyor...");
      const audioPath = await synthesizeVoice({
        text: langContent.voiceoverText,
        lang,
        voiceId: appConfig.tts.defaultVoiceId,
        topicSlug,
      });
      results[lang].audio = audioPath;

      // 4.3. Video oluştur
      logger.info(MODULE_NAME, "Video oluşturma başlatılıyor...");
      const videoPath = await createShortVideo({
        scriptText: langContent.voiceoverText,
        audioPath,
        outputPath: outputPaths.video,
        thumbnailText: langContent.thumbnailText,
        style: appConfig.video.style,
      });
      results[lang].video = videoPath;

      logger.groupEnd(MODULE_NAME, `${lang.toUpperCase()} İşlemleri`);
    }

    const elapsedTime = getElapsedTime(startTime);
    logger.success(
      MODULE_NAME,
      `Pipeline tamamlandı! (${formatElapsedTime(elapsedTime)})`,
      results
    );
    logger.groupEnd(MODULE_NAME, `Pipeline: "${topic}"`);

    return {
      topic,
      topicSlug,
      results,
      elapsedTime,
    };
  } catch (error) {
    logger.error(MODULE_NAME, "Pipeline başarısız", error);
    logger.groupEnd(MODULE_NAME, `Pipeline: "${topic}"`);
    throw error;
  }
};

