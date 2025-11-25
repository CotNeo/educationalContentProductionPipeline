import { mdToPdf } from 'md-to-pdf';
import { readdir, readFile } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Converts a markdown file to PDF.
 * @param {string} inputPath - Path to the markdown file
 * @param {string} outputPath - Path where PDF will be saved
 * @returns {Promise<boolean>} Success status
 */
export async function convertMarkdownToPdf(inputPath, outputPath) {
  try {
    console.log(`[PDFConverter] Starting conversion: ${inputPath} -> ${outputPath}`);

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      console.log(`[PDFConverter] Creating output directory: ${outputDir}`);
      mkdirSync(outputDir, { recursive: true });
    }

    // Read markdown content
    const markdownContent = await readFile(inputPath, 'utf-8');
    console.log(`[PDFConverter] Read markdown file, size: ${markdownContent.length} characters`);

    // Get stylesheet path
    const stylesheetPath = join(__dirname, 'styles.css');

    // Convert to PDF with responsive styling options
    const pdf = await mdToPdf(
      { content: markdownContent },
      {
        launch_options: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        pdf_options: {
          format: 'A4',
          margin: {
            top: '15mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm',
          },
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: false,
        },
        stylesheet: stylesheetPath,
        body_class: 'markdown-body',
        md_file_encoding: 'utf-8',
        as_html: false,
      }
    );

    if (pdf) {
      // Write PDF to file
      const fs = await import('fs/promises');
      await fs.writeFile(outputPath, pdf.content);
      console.log(`[PDFConverter] PDF created successfully: ${outputPath}`);
      return true;
    } else {
      console.error(`[PDFConverter] Failed to generate PDF for: ${inputPath}`);
      return false;
    }
  } catch (error) {
    console.error(`[PDFConverter] Error converting ${inputPath}:`, error);
    throw error;
  }
}

/**
 * Gets all markdown files from a directory.
 * @param {string} directory - Directory path to search
 * @returns {Promise<string[]>} Array of markdown file paths
 */
export async function getMarkdownFiles(directory) {
  try {
    console.log(`[PDFConverter] Scanning directory for markdown files: ${directory}`);
    const files = await readdir(directory);
    const markdownFiles = files
      .filter((file) => extname(file).toLowerCase() === '.md')
      .map((file) => join(directory, file));

    console.log(`[PDFConverter] Found ${markdownFiles.length} markdown file(s)`);
    return markdownFiles;
  } catch (error) {
    console.error(`[PDFConverter] Error reading directory ${directory}:`, error);
    throw error;
  }
}

/**
 * Generates output path for PDF file.
 * @param {string} inputPath - Input markdown file path
 * @param {string} outputDir - Output directory for PDFs
 * @returns {string} Output PDF file path
 */
export function generateOutputPath(inputPath, outputDir) {
  const fileName = basename(inputPath, extname(inputPath));
  return join(outputDir, `${fileName}.pdf`);
}

