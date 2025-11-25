/**
 * Script to convert a single markdown article to video script.
 * Usage: node src/generateSingle.js <filename> [type]
 * Example: node src/generateSingle.js solid.md educational
 */

import { generateVideoScript } from './scriptGenerator.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Converts a single markdown file to video script.
 */
async function main() {
  console.group('Single File Video Script Generation');
  
  // Get filename and optional type from command line arguments
  const fileName = process.argv[2];
  const articleType = process.argv[3] || null;

  if (!fileName) {
    console.error('[GenerateSingle] Error: Please provide a filename');
    console.error('[GenerateSingle] Usage: node src/generateSingle.js <filename> [type]');
    console.error('[GenerateSingle] Example: node src/generateSingle.js solid.md educational');
    console.error('[GenerateSingle] Valid types: educational, tutorial, deep_dive');
    console.groupEnd();
    process.exit(1);
  }

  // Validate type if provided
  if (articleType && !['educational', 'tutorial', 'deep_dive'].includes(articleType)) {
    console.error(`[GenerateSingle] Error: Invalid article type: ${articleType}`);
    console.error('[GenerateSingle] Valid types: educational, tutorial, deep_dive');
    console.groupEnd();
    process.exit(1);
  }

  try {
    // 1. Define paths
    const articlesDir = join(__dirname, '../../article-generation/articles');
    const inputPath = join(articlesDir, fileName);
    const outputDir = join(__dirname, '../output');

    console.log(`[GenerateSingle] Input file: ${inputPath}`);
    console.log(`[GenerateSingle] Output directory: ${outputDir}`);
    if (articleType) {
      console.log(`[GenerateSingle] Article type (override): ${articleType}`);
    }

    // 2. Generate script
    const success = await generateVideoScript(inputPath, outputDir, articleType);

    if (success) {
      console.log(`[GenerateSingle] Successfully generated video script for ${fileName}`);
    } else {
      console.error(`[GenerateSingle] Failed to generate script for ${fileName}`);
      process.exit(1);
    }

    console.groupEnd();
  } catch (error) {
    console.error('[GenerateSingle] Error:', error);
    console.groupEnd();
    process.exit(1);
  }
}

// Run the main function
main();






