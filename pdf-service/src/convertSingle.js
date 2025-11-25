import { convertMarkdownToPdf, generateOutputPath } from './pdfConverter.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Converts a single markdown file to PDF.
 * Usage: node src/convertSingle.js <filename>
 * Example: node src/convertSingle.js solid.md
 */
async function main() {
  console.group('Single File PDF Conversion');
  
  // Get filename from command line arguments
  const fileName = process.argv[2];

  if (!fileName) {
    console.error('[ConvertSingle] Error: Please provide a filename');
    console.error('[ConvertSingle] Usage: node src/convertSingle.js <filename>');
    console.error('[ConvertSingle] Example: node src/convertSingle.js solid.md');
    console.groupEnd();
    process.exit(1);
  }

  try {
    // 1. Define paths
    const articlesDir = join(__dirname, '../../article-generation/articles');
    const inputPath = join(articlesDir, fileName);
    const outputDir = join(__dirname, '../output');
    const outputPath = generateOutputPath(inputPath, outputDir);

    console.log(`[ConvertSingle] Input file: ${inputPath}`);
    console.log(`[ConvertSingle] Output file: ${outputPath}`);

    // 2. Convert file
    const success = await convertMarkdownToPdf(inputPath, outputPath);

    if (success) {
      console.log(`[ConvertSingle] Successfully converted ${fileName} to PDF`);
    } else {
      console.error(`[ConvertSingle] Failed to convert ${fileName}`);
      process.exit(1);
    }

    console.groupEnd();
  } catch (error) {
    console.error('[ConvertSingle] Error:', error);
    console.groupEnd();
    process.exit(1);
  }
}

// Run the main function
main();







