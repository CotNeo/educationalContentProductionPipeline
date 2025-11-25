/**
 * Main script to convert all markdown articles to video scripts.
 * Processes all .md files in article-generation/articles directory.
 */

import { generateVideoScript } from './scriptGenerator.js';
import { getMarkdownFiles } from './utils/articleReader.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main function to convert all markdown articles to video scripts.
 * Processes all .md files in article-generation/articles directory.
 */
async function main() {
  console.group('Video Script Generation Service');
  console.log('[Main] Starting video script generation process...');

  try {
    // 1. Define paths
    const articlesDir = join(__dirname, '../../article-generation/articles');
    const outputDir = join(__dirname, '../output');

    console.log(`[Main] Articles directory: ${articlesDir}`);
    console.log(`[Main] Output directory: ${outputDir}`);

    // 2. Get all markdown files
    const markdownFiles = await getMarkdownFiles(articlesDir);

    if (markdownFiles.length === 0) {
      console.log('[Main] No markdown files found. Exiting.');
      console.groupEnd();
      return;
    }

    // 3. Generate script for each file
    console.log(`[Main] Processing ${markdownFiles.length} file(s)...`);
    const results = [];

    for (const mdFile of markdownFiles) {
      try {
        const success = await generateVideoScript(mdFile, outputDir);
        results.push({ file: mdFile, success });
      } catch (error) {
        console.error(`[Main] Failed to process ${mdFile}:`, error.message);
        results.push({ file: mdFile, success: false, error: error.message });
      }
    }

    // 4. Summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`[Main] Generation complete!`);
    console.log(`[Main] Successful: ${successful}`);
    console.log(`[Main] Failed: ${failed}`);

    if (failed > 0) {
      console.error('[Main] Failed files:');
      results
        .filter((r) => !r.success)
        .forEach((r) => console.error(`  - ${r.file}: ${r.error || 'Unknown error'}`));
    }

    console.groupEnd();
  } catch (error) {
    console.error('[Main] Fatal error:', error);
    console.groupEnd();
    process.exit(1);
  }
}

// Run the main function
main();






