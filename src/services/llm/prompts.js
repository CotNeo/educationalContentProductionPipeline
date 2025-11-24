/**
 * LLM prompt'ları
 * İki dilli içerik üretimi için prompt şablonları
 */

/**
 * Tek dil için içerik üretimi prompt'u oluşturur
 * @param {string} topic - Konu başlığı
 * @param {string} lang - Dil kodu (tr veya en)
 * @returns {string} - Hazırlanmış prompt
 */
export const buildSingleLanguagePrompt = (topic, lang) => {
  const isTurkish = lang === "tr";
  
  if (isTurkish) {
    return `Sen profesyonel bir teknik yazarsın. "${topic}" konusu hakkında 800-1000 kelimelik detaylı bir Medium makalesi, 60 saniyelik video storyboard'u, 60 saniyelik voiceover metni ve thumbnail başlığı üret.

ÖNEMLİ: SADECE JSON döndür. Açıklama, önsöz veya ek metin EKLEME.

JSON formatı:
{
  "mediumArticle": "# ${topic}\\n\\n[Buraya 800-1000 kelimelik tam makale metni gelecek. Markdown formatında. Hikaye anlatımıyla başla, teknik detaylar ekle, ASCII diyagramlar kullan, kod örnekleri ver, best practices listele, sonuç yaz.]",
  "storyboard": "[00:00-00:03] Hook Sahnesi\\nTip: Hook\\nEkran Metni: ${topic}\\nAnimasyon: zoom-in\\nGörsel: İlgili ikon\\nArka Plan: Gradient\\nKamera: Static\\nGeçiş: fade\\nAnlatıcı: [60 saniyelik anlatımın ilk 3 saniyesi]\\nAmaç: Dikkat çekmek\\n\\n[00:03-00:10] Problem Sahnesi\\n...\\n\\n[En az 5 sahne, toplam 60 saniye]",
  "voiceoverText": "[60 saniyelik tam voiceover metni. Kısa cümleler, TTS uyumlu, akıcı. Storyboard ile uyumlu.]",
  "thumbnailText": "${topic} Rehberi"
}

ŞİMDİ "${topic}" KONUSU İÇİN TAM İÇERİKLERİ ÜRET. Sadece JSON döndür.`;
  } else {
    return `You are a professional technical writer. Generate detailed content about "${topic}": an 800-1000 word Medium article, a 60-second video storyboard, a 60-second voiceover text, and a thumbnail title.

IMPORTANT: Return ONLY JSON. Do NOT add explanations, prefaces, or extra text.

JSON format:
{
  "mediumArticle": "# ${topic}\\n\\n[Write the full 800-1000 word article here in Markdown format. Start with storytelling, add technical details, use ASCII diagrams, provide code examples, list best practices, write conclusion.]",
  "storyboard": "[00:00-00:03] Hook Scene\\nType: Hook\\nOn-screen Text: ${topic}\\nAnimation: zoom-in\\nVisual: Related icon\\nBackground: Gradient\\nCamera: Static\\nTransition: fade\\nNarrator: [First 3 seconds of 60-second narration]\\nPurpose: Grab attention\\n\\n[00:03-00:10] Problem Scene\\n...\\n\\n[At least 5 scenes, total 60 seconds]",
  "voiceoverText": "[Full 60-second voiceover text. Short sentences, TTS-optimized, fluent. Aligned with storyboard.]",
  "thumbnailText": "${topic} Guide"
}

NOW GENERATE THE FULL CONTENT FOR "${topic}". Return only JSON.`;
  }
};

/**
 * İki dilli içerik üretimi için prompt oluşturur (eski yöntem - artık kullanılmıyor)
 * @param {string} topic - Konu başlığı
 * @returns {string} - Hazırlanmış prompt
 * @deprecated buildSingleLanguagePrompt kullanın
 */
export const buildBilingualContentPrompt = (topic) => {
  return buildSingleLanguagePrompt(topic, "tr");
};

