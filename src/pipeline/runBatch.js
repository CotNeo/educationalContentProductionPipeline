/**
 * Çoklu konu için batch pipeline
 * topics.json dosyasından konuları okur ve her biri için pipeline çalıştırır
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { runForTopic } from "./runForTopic.js";
import { logger } from "../core/logger.js";
import { getProjectRoot } from "../config/paths.js";

const MODULE_NAME = "BatchPipeline";

/**
 * Batch pipeline çalıştırır
 * @param {string} topicsFilePath - topics.json dosya yolu (opsiyonel)
 * @returns {Promise<Array>} - Tüm sonuçlar
 */
export const runBatch = async (topicsFilePath = null) => {
  const projectRoot = getProjectRoot();
  const defaultTopicsPath = join(projectRoot, "topics.json");
  const filePath = topicsFilePath || defaultTopicsPath;

  logger.groupStart(MODULE_NAME, "Batch Pipeline Başlatıldı");

  try {
    // 1. Topics dosyasını oku
    logger.info(MODULE_NAME, "Topics dosyası okunuyor", { filePath });
    const fileContent = await readFile(filePath, "utf8");
    const topicsData = JSON.parse(fileContent);

    // Topics formatını kontrol et
    let topics = [];
    if (Array.isArray(topicsData)) {
      topics = topicsData;
    } else if (topicsData.topics && Array.isArray(topicsData.topics)) {
      topics = topicsData.topics;
    } else {
      throw new Error("Topics dosyası geçersiz format. Array veya { topics: [] } formatında olmalı.");
    }

    logger.info(MODULE_NAME, `${topics.length} konu bulundu`);

    // 2. Her konu için pipeline çalıştır
    const results = [];
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      logger.info(MODULE_NAME, `İşleniyor: ${i + 1}/${topics.length} - "${topic}"`);

      try {
        const result = await runForTopic(topic);
        results.push(result);
        logger.success(MODULE_NAME, `Konu tamamlandı: "${topic}"`);
      } catch (error) {
        logger.error(MODULE_NAME, `Konu başarısız: "${topic}"`, error);
        results.push({
          topic,
          error: error.message,
          success: false,
        });
      }

      // Konular arası kısa bekleme (isteğe bağlı)
      if (i < topics.length - 1) {
        logger.info(MODULE_NAME, "Sonraki konuya geçiliyor...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // 3. Özet rapor
    const successCount = results.filter((r) => r.success !== false).length;
    const failCount = results.length - successCount;

    logger.groupEnd(MODULE_NAME, "Batch Pipeline Tamamlandı");
    logger.success(MODULE_NAME, "Batch Pipeline Özeti", {
      total: topics.length,
      success: successCount,
      failed: failCount,
    });

    return results;
  } catch (error) {
    logger.error(MODULE_NAME, "Batch pipeline başarısız", error);
    logger.groupEnd(MODULE_NAME, "Batch Pipeline");
    throw error;
  }
};

