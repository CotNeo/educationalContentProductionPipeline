import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Loads a template file from the templates directory.
 * @param {string} templateName - Name of the template (without .txt extension)
 * @returns {string} Template content
 */
function loadTemplate(templateName) {
  console.log(`[buildPrompt] Loading template: ${templateName}`);
  
  const templatePath = join(__dirname, '../templates', `${templateName}.txt`);
  
  try {
    const template = readFileSync(templatePath, 'utf-8');
    console.log(`[buildPrompt] Template loaded successfully: ${templateName}`);
    return template;
  } catch (error) {
    console.error(`[buildPrompt] Error loading template ${templateName}:`, error);
    throw new Error(`Template file not found: ${templatePath}`);
  }
}

/**
 * Builds system and user prompts for Ollama/LLM based on topic configuration.
 * @param {Object} topic - Topic configuration object
 * @param {string} topic.skeleton - Template name (educational, tutorial, deep-dive)
 * @param {string} topic.title - Article title
 * @param {string} topic.language - Language code (tr, en)
 * @param {string} topic.audience - Target audience description
 * @param {string} topic.readingTime - Estimated reading time in minutes
 * @returns {Object} Object containing systemPrompt and userPrompt
 */
export function buildPrompt(topic) {
  console.log(`[buildPrompt] Building prompt for topic: ${topic.title}`);
  
  // 1. Load template (use English template if language is English)
  const templateName = topic.language === 'en' 
    ? `${topic.skeleton}-en` 
    : topic.skeleton;
  
  let template;
  try {
    template = loadTemplate(templateName);
  } catch (error) {
    // Fallback to default template if English version doesn't exist
    template = loadTemplate(topic.skeleton);
  }
  
  // 2. Replace title placeholder
  const skeletonWithTitle = template.replace('{{TITLE}}', topic.title);
  
  // 3. Build system prompt
  const isEnglish = topic.language === 'en';
  
  const systemPrompt = isEnglish
    ? `You are a senior full-stack developer and technical writer.
Target platform: Medium.
Target audience: ${topic.audience}.
Article language: English.
Reading time should be approximately ${topic.readingTime} minutes.
Write in a clear, understandable but technically accurate and deep style.
Generate in Markdown format (headings, subheadings, code blocks).
Don't forget to specify the language in code blocks (e.g., \`\`\`javascript, \`\`\`python).
The article should be ready to paste into Medium.
IMPORTANT: Do NOT include article type labels like "[ARTICLE TYPE: ...]" in the output. Start directly with the title as H1.`
    : `Sen bir senior full-stack developer ve teknik yazar olarak davran.
Hedef platform: Medium.
Hedef kitlen: ${topic.audience}.
Makale dili: Türkçe.
Okuma süresi yaklaşık ${topic.readingTime} dakika olsun.
Anlatım sade, anlaşılır ama teknik olarak doğru ve derin olsun.
Markdown formatında üret (başlıklar, alt başlıklar, code block'lar).
Code block'larda dil belirtmeyi unutma (ör: \`\`\`javascript, \`\`\`python).
Makale Medium'a yapıştırılabilir formatta olsun.
ÖNEMLİ: Çıktıda "[MAKALE TÜRÜ: ...]" gibi etiketler EKLEME. Doğrudan başlığı H1 olarak başla.`;

  // 4. Build user prompt
  const userPrompt = isEnglish
    ? `Write a complete Medium article using the following article skeleton:

================= SKELETON START =================
${skeletonWithTitle}
================= SKELETON END =================

TOPIC TITLE: ${topic.title}

Please follow the skeleton and fill each section with details and examples. The article should be ready for publication on Medium, professional and technically accurate.`
    : `Aşağıdaki makale iskeletini kullanarak tam dolu bir Medium makalesi yaz:

================= İSKELET BAŞLANGIÇ =================
${skeletonWithTitle}
================= İSKELET BİTİŞ =================

KONU BAŞLIĞI: ${topic.title}

Lütfen iskeleti takip ederek, her bölümü detaylı ve örneklerle doldur. Makale Medium'da yayınlanmaya hazır, profesyonel ve teknik olarak doğru olsun.`;

  console.log(`[buildPrompt] Prompt built successfully for: ${topic.title}`);
  
  return { systemPrompt, userPrompt };
}

