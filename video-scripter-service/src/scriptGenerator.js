/**
 * Video script generator service module.
 * Main service for converting articles to video scripts.
 */

import { callOllama, checkOllamaConnection } from './llm/callOllama.js';
import { buildSystemPrompt, buildUserPrompt } from './prompts/buildScriptPrompt.js';
import { readMarkdownFile, determineArticleType } from './utils/articleReader.js';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { existsSync } from 'fs';

/**
 * Generates video script from markdown article.
 * @param {string} articlePath - Path to markdown article file
 * @param {string} outputDir - Output directory for scripts
 * @param {string} articleType - Optional article type override
 * @returns {Promise<boolean>} Success status
 */
export async function generateVideoScript(articlePath, outputDir, articleType = null) {
  try {
    console.log(`[ScriptGenerator] Starting script generation: ${articlePath}`);

    // 1. Read article content
    const articleContent = await readMarkdownFile(articlePath);

    // 2. Determine article type if not provided
    if (!articleType) {
      articleType = determineArticleType(articleContent, articlePath);
    }

    console.log(`[ScriptGenerator] Article type: ${articleType}`);

    // 3. Check Ollama connection
    console.log('[ScriptGenerator] Checking Ollama connection...');
    const isOllamaRunning = await checkOllamaConnection();
    
    if (!isOllamaRunning) {
      throw new Error(
        'Ollama servisine bağlanılamadı!\n' +
        'Lütfen Ollama\'nın çalıştığından emin olun: ollama serve'
      );
    }
    
    console.log('[ScriptGenerator] ✅ Ollama connection successful');

    // 4. Build prompts
    console.log('[ScriptGenerator] Building prompts...');
    const systemPrompt = buildSystemPrompt(articleType);
    const userPrompt = buildUserPrompt(articleContent, articleType);
    console.log('[ScriptGenerator] ✅ Prompts ready');

    // 5. Generate script using Ollama
    console.log('[ScriptGenerator] Generating video script...');
    console.log('[ScriptGenerator] (This may take a few minutes, please wait...)');
    const scriptContent = await callOllama(systemPrompt, userPrompt);
    console.log('[ScriptGenerator] ✅ Script generated');

    // 6. Ensure output directory exists
    if (!existsSync(outputDir)) {
      console.log(`[ScriptGenerator] Creating output directory: ${outputDir}`);
      await mkdir(outputDir, { recursive: true });
    }

    // 7. Save script to file
    const fileName = basename(articlePath, extname(articlePath));
    const outputPath = join(outputDir, `${fileName}_script.txt`);
    
    await writeFile(outputPath, scriptContent, 'utf-8');
    console.log(`[ScriptGenerator] Script saved successfully: ${outputPath}`);

    return true;
  } catch (error) {
    console.error(`[ScriptGenerator] Error generating script for ${articlePath}:`, error);
    throw error;
  }
}






