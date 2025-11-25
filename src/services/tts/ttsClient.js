/**
 * TTS Client
 * Node.js'den Python TTS script'ine köprü
 */

import { spawn } from "child_process";
import { join } from "path";
import { logger } from "../../core/logger.js";
import { scriptPaths, getProjectRoot } from "../../config/paths.js";
import { fileExists } from "../../core/utils.js";

const MODULE_NAME = "TTSClient";

/**
 * Python TTS script'ini çalıştırır
 * @param {string} text - Seslendirilecek metin
 * @param {string} outputPath - Çıktı dosya yolu
 * @param {string} lang - Dil kodu (tr/en)
 * @returns {Promise<string>} - Çıktı dosya yolu
 */
export const runTTS = async ({ text, outputPath, lang }) => {
  logger.info(MODULE_NAME, "TTS işlemi başlatılıyor", { lang, outputPath });

  // Python script'inin var olduğunu kontrol et
  const scriptExists = await fileExists(scriptPaths.ttsPython);
  if (!scriptExists) {
    throw new Error(`TTS Python script bulunamadı: ${scriptPaths.ttsPython}`);
  }

  return new Promise((resolve, reject) => {
    // Virtual environment içindeki Python'u kullan
    const projectRoot = getProjectRoot();
    const venvPython = join(projectRoot, "venv", "bin", "python3");
    
    // Python script'ini çalıştır
    // venv/bin/python3 tts_generate.py "text" "output_path" "lang"
    const pythonProcess = spawn(venvPython, [
      scriptPaths.ttsPython,
      text,
      outputPath,
      lang,
    ]);

    let stdout = "";
    let stderr = "";

    // stdout topla
    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;
      logger.debug(MODULE_NAME, "TTS stdout", { output: output.trim() });
    });

    // stderr topla
    pythonProcess.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;
      // Python genelde bilgi mesajlarını stderr'e yazar, bu normal
      logger.debug(MODULE_NAME, "TTS stderr", { output: output.trim() });
    });

    // İşlem bittiğinde
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        logger.success(MODULE_NAME, "TTS işlemi başarılı", { outputPath });
        resolve(outputPath);
      } else {
        const error = new Error(
          `TTS işlemi başarısız (exit code: ${code})\nSTDERR: ${stderr}\nSTDOUT: ${stdout}`
        );
        logger.error(MODULE_NAME, "TTS işlemi başarısız", error);
        reject(error);
      }
    });

    // Hata durumu
    pythonProcess.on("error", (error) => {
      logger.error(MODULE_NAME, "TTS process hatası", error);
      reject(new Error(`TTS process başlatılamadı: ${error.message}`));
    });
  });
};

