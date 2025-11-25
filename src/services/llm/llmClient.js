/**
 * Ollama HTTP client
 * LLM API çağrılarını yönetir
 */

import axios from "axios";
import { appConfig } from "../../config/appConfig.js";
import { logger } from "../../core/logger.js";

const MODULE_NAME = "LLMClient";

/**
 * Ollama API'ye istek gönderir
 * @param {string} prompt - Gönderilecek prompt
 * @returns {Promise<string>} - LLM'den gelen yanıt
 */
export const callOllama = async ({ prompt }) => {
  logger.info(MODULE_NAME, "Ollama API çağrısı başlatılıyor", { model: appConfig.llm.model });

  try {
    const response = await axios.post(
      `${appConfig.llm.baseUrl}/api/chat`,
      {
        model: appConfig.llm.model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        format: "json",
        stream: false,
        options: {
          temperature: appConfig.llm.temperature,
          num_predict: 3000, // Maksimum token sayısı (800-1000 kelime için yeterli)
        },
      },
      {
        timeout: appConfig.llm.timeout,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Ollama yanıt formatı: { message: { content: "..." } }
    const content = response.data?.message?.content || response.data?.response || "";

    if (!content) {
      throw new Error("Ollama'dan boş yanıt alındı");
    }

    logger.success(MODULE_NAME, "Ollama API çağrısı başarılı", {
      responseLength: content.length,
    });

    return content;
  } catch (error) {
    logger.error(MODULE_NAME, "Ollama API çağrısı başarısız", error);
    
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        `Ollama servisine bağlanılamadı. Lütfen 'ollama serve' komutunu çalıştırdığınızdan emin olun.`
      );
    }
    
    throw error;
  }
};

/**
 * JSON yanıtı parse eder ve doğrular
 * @param {string} rawResponse - Ham yanıt string'i
 * @returns {Promise<Object>} - Parse edilmiş JSON objesi
 */
export const parseJsonResponse = async (rawResponse) => {
  logger.debug(MODULE_NAME, "JSON yanıtı parse ediliyor");

  try {
    // JSON kod bloğu varsa çıkar
    let jsonString = rawResponse.trim();
    
    // ```json ... ``` formatını temizle
    if (jsonString.startsWith("```")) {
      const lines = jsonString.split("\n");
      const startIndex = lines.findIndex((line) => line.includes("```"));
      const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.includes("```"));
      
      if (startIndex !== -1 && endIndex !== -1) {
        jsonString = lines.slice(startIndex + 1, endIndex).join("\n");
      }
    }

    const parsed = JSON.parse(jsonString);
    logger.success(MODULE_NAME, "JSON yanıtı başarıyla parse edildi");
    return parsed;
  } catch (error) {
    logger.error(MODULE_NAME, "JSON parse hatası", error);
    logger.debug(MODULE_NAME, "Ham yanıt", { rawResponse: rawResponse.substring(0, 500) });
    throw new Error(`JSON parse hatası: ${error.message}`);
  }
};

