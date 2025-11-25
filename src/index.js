#!/usr/bin/env node
/**
 * Ana entry point
 * CLI'den çağrılır: node src/index.js "Konu başlığı"
 */

import { runForTopic } from "./pipeline/runForTopic.js";
import { runBatch } from "./pipeline/runBatch.js";
import { logger } from "./core/logger.js";
import { ensureDirectories } from "./config/paths.js";

const MODULE_NAME = "Main";

/**
 * Ana fonksiyon
 */
const main = async () => {
  try {
    // Dizinleri oluştur
    ensureDirectories();

    // Komut satırı argümanlarını al
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log(`
🧠 İki Dilli YouTube + Medium Otomasyonu

Kullanım:
  node src/index.js "Konu başlığı"     # Tek konu için pipeline çalıştır
  node src/index.js --batch            # topics.json'dan batch işlem

Örnek:
  node src/index.js "API nedir?"
  node src/index.js --batch

Çıktılar:
  📄 runtime/output/articles/  - Medium yazıları
  🔊 runtime/output/audio/     - Ses dosyaları
  🎬 runtime/output/videos/    - YouTube Shorts videoları
      `);
      process.exit(0);
    }

    // Batch modu
    if (args[0] === "--batch" || args[0] === "-b") {
      logger.info(MODULE_NAME, "Batch modu başlatılıyor");
      const topicsFilePath = args[1] || null;
      await runBatch(topicsFilePath);
      return;
    }

    // Tek konu modu
    const topic = args.join(" ");
    if (!topic || topic.trim().length === 0) {
      throw new Error("Konu başlığı boş olamaz");
    }

    logger.info(MODULE_NAME, "Tek konu modu başlatılıyor", { topic });
    const result = await runForTopic(topic);

    // Sonuçları özetle
    console.log("\n✅ Pipeline başarıyla tamamlandı!\n");
    console.log("📄 Oluşturulan dosyalar:\n");
    
    for (const lang of ["tr", "en"]) {
      console.log(`  ${lang.toUpperCase()}:`);
      console.log(`    📝 Makale: ${result.results[lang].article}`);
      console.log(`    🔊 Ses:    ${result.results[lang].audio}`);
      console.log(`    🎬 Video:  ${result.results[lang].video}`);
      console.log("");
    }

    process.exit(0);
  } catch (error) {
    logger.error(MODULE_NAME, "Uygulama hatası", error);
    console.error("\n❌ Hata:", error.message);
    process.exit(1);
  }
};

// Uygulamayı başlat
main();

