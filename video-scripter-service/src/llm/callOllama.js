/**
 * Ollama API üzerinden video script üreten modül.
 * Local Ollama servisine HTTP isteği gönderir ve video script içeriği üretir.
 */

import fetch from 'node-fetch';

// Ollama yapılandırması
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:14b';

/**
 * Ollama API'sine istek gönderir ve video script içeriği üretir.
 * @param {string} systemPrompt - Sistem prompt'u (rol, stil, format vb.)
 * @param {string} userPrompt - Kullanıcı prompt'u (makale içeriği ve tip)
 * @returns {Promise<string>} Üretilen video script içeriği
 */
export async function callOllama(systemPrompt, userPrompt) {
  console.log('[callOllama] Ollama API çağrısı yapılıyor...');
  console.log(`[callOllama] URL: ${OLLAMA_URL}`);
  console.log(`[callOllama] Model: ${OLLAMA_MODEL}`);

  const apiUrl = `${OLLAMA_URL}/api/chat`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
      }),
    });

    // HTTP hata kontrolü
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[callOllama] HTTP ${response.status}: ${errorText}`);
      
      if (response.status === 404) {
        throw new Error(
          `Ollama modeli bulunamadı: ${OLLAMA_MODEL}\n` +
          `Lütfen modeli yükleyin: ollama pull ${OLLAMA_MODEL}`
        );
      } else if (response.status === 503 || response.status === 500) {
        throw new Error(
          `Ollama servisi çalışmıyor veya erişilemiyor.\n` +
          `Lütfen Ollama'nın çalıştığından emin olun: ollama serve\n` +
          `URL: ${OLLAMA_URL}`
        );
      } else {
        throw new Error(`Ollama API hatası (${response.status}): ${errorText}`);
      }
    }

    const data = await response.json();

    // Response yapısı kontrolü
    if (!data.message || !data.message.content) {
      console.error('[callOllama] Beklenmeyen response yapısı:', data);
      throw new Error('Ollama API\'den geçersiz response alındı');
    }

    const content = data.message.content;

    if (!content || content.trim().length === 0) {
      throw new Error('Ollama API\'den boş içerik döndü');
    }

    console.log(`[callOllama] Video script başarıyla üretildi (${content.length} karakter)`);
    return content;
  } catch (error) {
    // Network hataları
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error(
        `Ollama servisine bağlanılamadı: ${OLLAMA_URL}\n` +
        `Lütfen Ollama'nın çalıştığından emin olun:\n` +
        `  1. Ollama kurulu mu? (ollama --version)\n` +
        `  2. Ollama servisi çalışıyor mu? (ollama serve)\n` +
        `  3. Model yüklü mü? (ollama list)`
      );
    }

    // Diğer hatalar
    if (error.message) {
      throw error;
    }

    throw new Error(`Ollama çağrısı sırasında hata: ${error}`);
  }
}

/**
 * Ollama servisinin çalışıp çalışmadığını kontrol eder.
 * @returns {Promise<boolean>} Servis çalışıyorsa true
 */
export async function checkOllamaConnection() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}






