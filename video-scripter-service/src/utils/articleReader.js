/**
 * Article reader utility module.
 * Reads markdown files and determines article type.
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname, basename } from 'path';

/**
 * Gets all markdown files from a directory.
 * @param {string} directory - Directory path to search
 * @returns {Promise<string[]>} Array of markdown file paths
 */
export async function getMarkdownFiles(directory) {
  try {
    console.log(`[ArticleReader] Scanning directory for markdown files: ${directory}`);
    const files = await readdir(directory);
    const markdownFiles = files
      .filter((file) => extname(file).toLowerCase() === '.md')
      .map((file) => join(directory, file));

    console.log(`[ArticleReader] Found ${markdownFiles.length} markdown file(s)`);
    return markdownFiles;
  } catch (error) {
    console.error(`[ArticleReader] Error reading directory ${directory}:`, error);
    throw error;
  }
}

/**
 * Reads markdown file content.
 * @param {string} filePath - Path to markdown file
 * @returns {Promise<string>} File content
 */
export async function readMarkdownFile(filePath) {
  try {
    console.log(`[ArticleReader] Reading file: ${filePath}`);
    const content = await readFile(filePath, 'utf-8');
    console.log(`[ArticleReader] Read file, size: ${content.length} characters`);
    return content;
  } catch (error) {
    console.error(`[ArticleReader] Error reading file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Determines article type from content or filename.
 * Checks for keywords in content and filename.
 * @param {string} content - Article content
 * @param {string} filePath - File path (for filename analysis)
 * @returns {string} Article type: 'educational', 'tutorial', or 'deep_dive'
 */
export function determineArticleType(content, filePath) {
  console.log(`[ArticleReader] Determining article type for: ${basename(filePath)}`);
  
  const lowerContent = content.toLowerCase();
  const fileName = basename(filePath, extname(filePath)).toLowerCase();

  // Check for tutorial indicators
  const tutorialKeywords = [
    'step-by-step',
    'step by step',
    'tutorial',
    'prerequisites',
    'project structure',
    'implementation',
    'final version',
    'debugging',
  ];

  // Check for deep dive indicators
  const deepDiveKeywords = [
    'deep dive',
    'deep-dive',
    'comprehensive',
    'internal workflow',
    'architecture',
    'advanced',
    'technical analysis',
  ];

  // Check filename
  if (fileName.includes('tutorial') || fileName.includes('guide')) {
    console.log(`[ArticleReader] Type determined from filename: tutorial`);
    return 'tutorial';
  }

  if (fileName.includes('deep') || fileName.includes('dive')) {
    console.log(`[ArticleReader] Type determined from filename: deep_dive`);
    return 'deep_dive';
  }

  // Check content for tutorial
  const tutorialMatches = tutorialKeywords.filter((keyword) =>
    lowerContent.includes(keyword)
  ).length;

  // Check content for deep dive
  const deepDiveMatches = deepDiveKeywords.filter((keyword) =>
    lowerContent.includes(keyword)
  ).length;

  // Determine type based on matches
  if (tutorialMatches >= 3) {
    console.log(`[ArticleReader] Type determined from content: tutorial (${tutorialMatches} matches)`);
    return 'tutorial';
  }

  if (deepDiveMatches >= 2) {
    console.log(`[ArticleReader] Type determined from content: deep_dive (${deepDiveMatches} matches)`);
    return 'deep_dive';
  }

  // Default to educational
  console.log(`[ArticleReader] Type determined: educational (default)`);
  return 'educational';
}






