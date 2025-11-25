/**
 * Genel uygulama ayarları
 * Diller, süreler, model isimleri ve diğer konfigürasyonlar
 */

export const appConfig = {
  // Desteklenen diller
  languages: {
    tr: {
      code: "tr",
      name: "Türkçe",
      locale: "tr_TR",
    },
    en: {
      code: "en",
      name: "English",
      locale: "en_US",
    },
  },

  // LLM Ayarları
  llm: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "mistral",
    timeout: 600000, // 10 dakika (800-1000 kelime için yeterli)
    temperature: 0.7,
  },

  // TTS Ayarları
  tts: {
    pythonScript: process.env.TTS_PYTHON_SCRIPT || "tts_generate.py",
    voiceSamplePath: process.env.VOICE_SAMPLE_PATH || "runtime/voice_samples/furkan.wav",
    defaultVoiceId: "furkan-default",
  },

  // Video Ayarları
  video: {
    width: parseInt(process.env.VIDEO_WIDTH) || 1080,
    height: parseInt(process.env.VIDEO_HEIGHT) || 1920,
    fps: parseInt(process.env.VIDEO_FPS) || 30,
    duration: {
      min: 15, // minimum saniye
      max: 60, // maksimum saniye
    },
    style: "minimal", // minimal, gradient, modern
  },

  // İçerik Ayarları
  content: {
    mediumArticle: {
      minWords: 800,
      maxWords: 1000,
    },
    shortScript: {
      minWords: 50,
      maxWords: 200,
      targetDuration: 30, // saniye
    },
  },
};

