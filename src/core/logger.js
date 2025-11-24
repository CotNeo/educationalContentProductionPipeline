/**
 * Basit konsol + dosya log sistemi
 * Her log mesajı hem konsola hem dosyaya yazılır
 */

import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getProjectRoot } from "../config/paths.js";

const projectRoot = getProjectRoot();
const logDir = join(projectRoot, "runtime/output/logs");
const logFile = join(logDir, `app-${new Date().toISOString().split("T")[0]}.log`);

// Log dizinini oluştur
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

/**
 * Log mesajını formatlar
 */
const formatLogMessage = (level, module, message, data = null) => {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  return `[${timestamp}] [${level}] [${module}] ${message}${dataStr}\n`;
};

/**
 * Log yazar (konsol + dosya)
 */
const writeLog = (level, module, message, data = null) => {
  const logMessage = formatLogMessage(level, module, message, data);
  
  // Konsola yaz
  const consoleMethod = level === "ERROR" ? console.error : console.log;
  consoleMethod(logMessage.trim());
  
  // Dosyaya yaz
  try {
    appendFileSync(logFile, logMessage, "utf8");
  } catch (error) {
    console.error(`[Logger] Failed to write to log file: ${error.message}`);
  }
};

/**
 * Logger modülü
 */
export const logger = {
  /**
   * Bilgi logu
   */
  info: (module, message, data = null) => {
    writeLog("INFO", module, message, data);
  },

  /**
   * Hata logu
   */
  error: (module, message, error = null) => {
    const errorData = error
      ? {
          message: error.message,
          stack: error.stack,
        }
      : null;
    writeLog("ERROR", module, message, errorData);
  },

  /**
   * Başarı logu
   */
  success: (module, message, data = null) => {
    writeLog("SUCCESS", module, message, data);
  },

  /**
   * Debug logu
   */
  debug: (module, message, data = null) => {
    writeLog("DEBUG", module, message, data);
  },

  /**
   * Grup logu (başlangıç)
   */
  groupStart: (module, title) => {
    const message = `━━━ ${title} ━━━`;
    writeLog("INFO", module, message);
  },

  /**
   * Grup logu (bitiş)
   */
  groupEnd: (module, title) => {
    const message = `━━━ ${title} Tamamlandı ━━━`;
    writeLog("SUCCESS", module, message);
  },
};

