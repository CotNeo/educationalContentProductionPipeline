/**
 * Tüm klasör ve dosya yollarını yönetir
 * Proje kök dizinine göre relative path'ler
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "../..");

/**
 * Proje kök dizinini döndürür
 */
export const getProjectRoot = () => projectRoot;

/**
 * Runtime klasör yolları
 */
export const runtimePaths = {
  voiceSamples: join(projectRoot, "runtime/voice_samples"),
  output: join(projectRoot, "runtime/output"),
  articles: join(projectRoot, "runtime/output/articles"),
  audio: join(projectRoot, "runtime/output/audio"),
  videos: join(projectRoot, "runtime/output/videos"),
  logs: join(projectRoot, "runtime/output/logs"),
};

/**
 * Script yolları
 */
export const scriptPaths = {
  ttsPython: join(projectRoot, "tts_generate.py"),
};

/**
 * Klasörleri oluşturur (yoksa)
 */
export const ensureDirectories = () => {
  Object.values(runtimePaths).forEach((path) => {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      console.log(`[Paths] Created directory: ${path}`);
    }
  });
};

/**
 * Topic slug'ına göre dosya isimleri oluşturur
 */
export const getOutputPaths = (topicSlug, lang) => {
  return {
    article: join(runtimePaths.articles, `${topicSlug}-${lang}.md`),
    audio: join(runtimePaths.audio, `${topicSlug}-${lang}.wav`),
    video: join(runtimePaths.videos, `${topicSlug}-${lang}.mp4`),
  };
};

