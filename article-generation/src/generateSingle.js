/**
 * Tek bir makale üretmek için CLI aracı.
 * İnteraktif veya komut satırı argümanları ile kullanılabilir.
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildPrompt } from './prompts/buildPrompt.js';
import { callOllama, checkOllamaConnection } from './llm/callOllama.js';
import { ensureArticlesDirectory, saveArticleToFile, getArticleSlug } from './utils/fileUtils.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Komut satırı argümanlarını parse eder.
 * @returns {Object} Parsed arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const result = {
    topic: null,
    skeleton: null,
    time: null,
    interactive: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--topic' || arg === '-t') {
      result.topic = args[i + 1];
      i++;
    } else if (arg === '--skeleton' || arg === '-s') {
      result.skeleton = args[i + 1];
      i++;
    } else if (arg === '--time' || arg === '-m') {
      result.time = args[i + 1];
      i++;
    } else if (arg === '--interactive' || arg === '-i') {
      result.interactive = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }

  return result;
}

/**
 * Yardım mesajını gösterir.
 */
function showHelp() {
  console.log(`
📝 Tek Makale Üretim Aracı

Kullanım:
  npm run generate:single [seçenekler]

Seçenekler:
  --topic, -t <konu>        Makale konusu (örn: "JavaScript Loops")
  --skeleton, -s <tür>     Şablon türü: educational, tutorial, deep-dive
  --time, -m <dakika>      Okuma süresi (dakika, varsayılan: 8)
  --interactive, -i        İnteraktif mod (sorular sorar)
  --help, -h               Bu yardım mesajını gösterir

Örnekler:
  npm run generate:single -- --topic "JavaScript Loops" --skeleton educational --time 8
  npm run generate:single -- --interactive
  npm run generate:single -t "React Hooks" -s tutorial -m 10

Not: Dil her zaman İngilizce olacaktır.
`);
}

/**
 * İnteraktif mod: kullanıcıdan bilgileri alır.
 * @returns {Promise<Object>} Topic configuration
 */
async function interactiveMode() {
  const readline = await import('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    console.log('\n📝 İnteraktif Makale Üretimi\n');

    const topic = await question('Makale konusu: ');
    if (!topic.trim()) {
      throw new Error('Konu boş olamaz');
    }

    console.log('\nŞablon türleri:');
    console.log('  1. educational - Eğitici teknik makale');
    console.log('  2. tutorial - Adım adım tutorial');
    console.log('  3. deep-dive - Derin teknik inceleme');
    
    const skeletonChoice = await question('\nŞablon türü seçin (1-3) [1]: ');
    const skeletonMap = {
      '1': 'educational',
      '2': 'tutorial',
      '3': 'deep-dive',
      '': 'educational',
    };
    const skeleton = skeletonMap[skeletonChoice] || 'educational';

    const timeInput = await question('Okuma süresi (dakika) [8]: ');
    const time = timeInput.trim() || '8';

    rl.close();

    return {
      title: topic.trim(),
      skeleton,
      readingTime: time,
      language: 'en',
      audience: 'developers',
    };
  } catch (error) {
    rl.close();
    throw error;
  }
}

/**
 * Argümanlardan topic configuration oluşturur.
 * @param {Object} args - Parsed arguments
 * @returns {Object} Topic configuration
 */
function createTopicFromArgs(args) {
  if (!args.topic) {
    throw new Error('--topic argümanı gereklidir. --help ile yardım alabilirsiniz.');
  }

  const skeleton = args.skeleton || 'educational';
  if (!['educational', 'tutorial', 'deep-dive'].includes(skeleton)) {
    throw new Error(`Geçersiz skeleton türü: ${skeleton}. educational, tutorial veya deep-dive olmalı.`);
  }

  const time = args.time || '8';

  return {
    title: args.topic,
    skeleton,
    readingTime: time,
    language: 'en',
    audience: 'developers',
  };
}


/**
 * Ana fonksiyon.
 */
async function main() {
  try {
    const args = parseArguments();

    // İnteraktif mod
    let topic;
    if (args.interactive || (!args.topic && !args.skeleton)) {
      topic = await interactiveMode();
    } else {
      topic = createTopicFromArgs(args);
    }

    // Slug oluştur
    const slug = getArticleSlug(topic);

    console.log('\n🚀 Makale Üretimi Başlatıldı');
    console.log('='.repeat(60));
    console.log(`📝 Konu: ${topic.title}`);
    console.log(`📋 Şablon: ${topic.skeleton}`);
    console.log(`⏱️  Okuma Süresi: ${topic.readingTime} dakika`);
    console.log(`🌍 Dil: İngilizce`);
    console.log('='.repeat(60) + '\n');

    // Ollama bağlantısını kontrol et
    console.log('[generateSingle] Ollama bağlantısı kontrol ediliyor...');
    const isOllamaRunning = await checkOllamaConnection();
    
    if (!isOllamaRunning) {
      console.error('\n❌ Ollama servisine bağlanılamadı!');
      console.error('   Lütfen Ollama\'nın çalıştığından emin olun: ollama serve');
      process.exit(1);
    }
    
    console.log('[generateSingle] ✅ Ollama bağlantısı başarılı\n');

    // Prompt'ları oluştur
    console.log('[generateSingle] Prompt\'lar oluşturuluyor...');
    const { systemPrompt, userPrompt } = buildPrompt(topic);
    console.log('[generateSingle] ✅ Prompt\'lar hazır\n');

    // Makale içeriğini üret
    console.log('[generateSingle] Makale içeriği üretiliyor...');
    console.log('   (Bu işlem birkaç dakika sürebilir, lütfen bekleyin...)\n');
    const articleContent = await callOllama(systemPrompt, userPrompt);

    // Dosyaya kaydet
    const articlesDir = join(__dirname, '..', 'articles');
    ensureArticlesDirectory(articlesDir);
    const filePath = saveArticleToFile(articlesDir, slug, articleContent);

    console.log('='.repeat(60));
    console.log('✅ Makale başarıyla üretildi!');
    console.log(`📁 Dosya: ${filePath}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    if (error.message.includes('--topic')) {
      console.log('\n💡 Yardım için: npm run generate:single -- --help\n');
    }
    process.exit(1);
  }
}

main();

