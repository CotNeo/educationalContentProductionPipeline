import { convertMarkdownToPdf, getMarkdownFiles, generateOutputPath } from './pdfConverter.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main function to convert all markdown articles to PDF.
 * Processes all .md files in article-generation/articles directory.
 */
async function main() {
  console.group('PDF Conversion Service');
  console.log('[Main] Starting PDF conversion process...');

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

    // 3. Convert each file
    console.log(`[Main] Processing ${markdownFiles.length} file(s)...`);
    const results = [];

    for (const mdFile of markdownFiles) {
      const outputPath = generateOutputPath(mdFile, outputDir);
      const success = await convertMarkdownToPdf(mdFile, outputPath);
      results.push({ file: mdFile, success });
    }

    // 4. Summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`[Main] Conversion complete!`);
    console.log(`[Main] Successful: ${successful}`);
    console.log(`[Main] Failed: ${failed}`);

    if (failed > 0) {
      console.error('[Main] Failed files:');
      results
        .filter((r) => !r.success)
        .forEach((r) => console.error(`  - ${r.file}`));
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







