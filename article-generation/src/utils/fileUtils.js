/**
 * Dosya işlemleri için yardımcı fonksiyonlar.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import slugify from 'slugify';

/**
 * Articles klasörünün varlığını kontrol eder, yoksa oluşturur.
 * @param {string} articlesDir - Articles klasör yolu
 */
export function ensureArticlesDirectory(articlesDir) {
  try {
    mkdirSync(articlesDir, { recursive: true });
  } catch (error) {
    throw new Error(`Articles klasörü oluşturulamadı: ${error.message}`);
  }
}

/**
 * Makale içeriğini .md dosyasına kaydeder.
 * @param {string} articlesDir - Articles klasör yolu
 * @param {string} slug - Dosya adı için slug
 * @param {string} content - Makale içeriği
 */
export function saveArticleToFile(articlesDir, slug, content) {
  const filename = `${slug}.md`;
  const filePath = join(articlesDir, filename);
  
  try {
    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  } catch (error) {
    throw new Error(`Makale kaydedilemedi (${filename}): ${error.message}`);
  }
}

/**
 * Topic'ten slug üretir.
 * @param {Object} topic - Topic objesi
 * @returns {string} Slug
 */
export function getArticleSlug(topic) {
  if (topic.slug) {
    return topic.slug;
  }
  
  return slugify(topic.title, {
    lower: true,
    strict: true,
    locale: 'en',
  });
}

