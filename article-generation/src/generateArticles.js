/**
 * Ana makale üretim scripti.
 * topics.json dosyasındaki her konu için Ollama üzerinden DeepSeek R1 ile makale üretir.
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildPrompt } from './prompts/buildPrompt.js';
import { callOllama, checkOllamaConnection } from './llm/callOllama.js';
import { ensureArticlesDirectory, saveArticleToFile, getArticleSlug } from './utils/fileUtils.js';

// Environment variables yükle
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * topics.json dosyasından konuları yükler.
 * @returns {Array} Konu objeleri dizisi
 */
function loadTopics() {
  console.log('[generateArticles] Konular yükleniyor...');
  
  const topicsPath = join(__dirname, 'config', 'topics.json');
  
  try {
    const topicsContent = readFileSync(topicsPath, 'utf-8');
    const topics = JSON.parse(topicsContent);
    console.log(`[generateArticles] ${topics.length} konu yüklendi`);
    return topics;
  } catch (error) {
    console.error('[generateArticles] Konular yüklenirken hata:', error);
    throw new Error(`topics.json okunamadı: ${error.message}`);
  }
}


/**
 * Ana fonksiyon: Tüm makale üretim sürecini yönetir.
 */
async function main() {
  console.group('🚀 Medium Makale Üretimi Başlatıldı');
  
  try {
    // 1. Ollama bağlantısını kontrol et
    console.log('[generateArticles] Ollama bağlantısı kontrol ediliyor...');
    const isOllamaRunning = await checkOllamaConnection();
    
    if (!isOllamaRunning) {
      console.error('\n❌ Ollama servisine bağlanılamadı!');
      console.error('   Lütfen şunları kontrol edin:');
      console.error('   1. Ollama kurulu mu? (ollama --version)');
      console.error('   2. Ollama servisi çalışıyor mu? (ollama serve)');
      console.error('   3. Model yüklü mü? (ollama list)');
      console.error('   4. .env dosyasında OLLAMA_URL doğru mu?');
      console.groupEnd();
      process.exit(1);
    }
    
    console.log('[generateArticles] ✅ Ollama bağlantısı başarılı');
    
    // 2. Konuları yükle
    const topics = loadTopics();
    
    if (topics.length === 0) {
      console.log('[generateArticles] Konu bulunamadı. Çıkılıyor.');
      console.groupEnd();
      return;
    }
    
    // 3. Articles klasörünü hazırla
    const articlesDir = join(__dirname, '..', 'articles');
    ensureArticlesDirectory(articlesDir);
    console.log(`[generateArticles] Articles klasörü hazır: ${articlesDir}`);
    
    // 4. Her konu için makale üret
    console.log(`\n[generateArticles] ${topics.length} konu işleniyor...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      console.group(`📝 Konu ${i + 1}/${topics.length}: ${topic.title}`);
      
      try {
        // 4.1. Prompt'ları oluştur
        const { systemPrompt, userPrompt } = buildPrompt(topic);
        
        // 4.2. Ollama ile makale içeriği üret
        console.log('[generateArticles] Ollama ile makale üretiliyor...');
        const articleContent = await callOllama(systemPrompt, userPrompt);
        
        // 4.3. Slug oluştur ve dosyaya kaydet
        const slug = getArticleSlug(topic);
        const filePath = saveArticleToFile(articlesDir, slug, articleContent);
        
        console.log(`✅ [generateArticles] Başarıyla üretildi: ${slug}.md`);
        console.log(`[generateArticles] Makale kaydedildi: ${filePath}`);
        successCount++;
        
        // Makaleler arası kısa bekleme (isteğe bağlı)
        if (i < topics.length - 1) {
          console.log('[generateArticles] Bir sonraki makale için bekleniyor...\n');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ [generateArticles] Hata: ${error.message}`);
        console.log('[generateArticles] Bir sonraki konuya geçiliyor...\n');
      }
      
      console.groupEnd();
    }
    
    // 5. Özet
    console.log('\n' + '='.repeat(60));
    console.log('📊 ÜRETİM ÖZETİ');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı: ${successCount} makale`);
    console.log(`❌ Başarısız: ${errorCount} makale`);
    console.log(`📝 Toplam: ${topics.length} konu`);
    
    if (successCount > 0) {
      console.log(`\n✅ ${successCount} makale başarıyla oluşturuldu: articles/ klasöründe`);
    }
    
    if (errorCount > 0) {
      console.log(`\n⚠️  ${errorCount} makale üretilemedi. Hata mesajlarını kontrol edin.`);
    }
    
    console.log('='.repeat(60) + '\n');
    console.groupEnd();
  } catch (error) {
    console.error('\n❌ [generateArticles] Kritik hata:', error.message);
    console.groupEnd();
    process.exit(1);
  }
}

// Ana fonksiyonu çalıştır
main();
