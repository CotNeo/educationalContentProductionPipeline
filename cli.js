#!/usr/bin/env node
/**
 * Interactive CLI for Educational Content Production Pipeline
 * 
 * Provides a user-friendly interface to coordinate all services:
 * - Article Generation
 * - PDF Service
 * - Video Scripter Service
 * - TTS Service
 * - Video Generation Service
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Paths
const PATHS = {
  articles: join(__dirname, 'article-generation', 'articles'),
  pdfOutput: join(__dirname, 'pdf-service', 'output'),
  scriptOutput: join(__dirname, 'video-scripter-service', 'output'),
  ttsOutput: join(__dirname, 'tts-service', 'out'),
  videoOutput: join(__dirname, 'video-generation-service', 'output'),
};

// Readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Helper function to ask questions
 */
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

/**
 * Clear console
 */
function clearConsole() {
  console.clear();
  console.log('\n');
}

/**
 * Print colored text
 */
function colorPrint(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

/**
 * Print header
 */
function printHeader() {
  clearConsole();
  colorPrint('═'.repeat(70), 'cyan');
  colorPrint('  Educational Content Production Pipeline - Interactive CLI', 'bright');
  colorPrint('═'.repeat(70), 'cyan');
  console.log();
}

/**
 * Print menu
 */
function printMenu() {
  colorPrint('📋 Main Menu', 'bright');
  colorPrint('─'.repeat(70), 'dim');
  console.log();
  console.log('  1. 📝 Generate New Article');
  console.log('  2. 📄 Generate PDF from Article');
  console.log('  3. 📋 Generate Video Script from Article');
  console.log('  4. 🎙️  Generate TTS Audio from Script');
  console.log('  5. 🎬 Generate Video from Script + Audio');
  console.log('  6. 🚀 Full Pipeline (Article → Script → Audio → Video)');
  console.log('  7. 📊 Check Service Status');
  console.log('  8. 📁 List Available Articles');
  console.log('  9. 📁 List Generated Files');
  console.log('  0. ❌ Exit');
  console.log();
}

/**
 * Check if Ollama is running
 */
async function checkOllamaStatus() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Check if Python virtual environment exists
 */
function checkPythonVenv(serviceName) {
  const venvPath = join(__dirname, serviceName, 'venv');
  return existsSync(venvPath);
}

/**
 * Check service status
 */
async function checkServiceStatus() {
  printHeader();
  colorPrint('📊 Service Status Check', 'bright');
  colorPrint('─'.repeat(70), 'dim');
  console.log();

  // Check Ollama
  colorPrint('Checking Ollama service...', 'dim');
  const ollamaRunning = await checkOllamaStatus();
  if (ollamaRunning) {
    colorPrint('  ✅ Ollama is running', 'green');
  } else {
    colorPrint('  ❌ Ollama is not running', 'red');
    colorPrint('     Start it with: ollama serve', 'yellow');
  }
  console.log();

  // Check Node.js services
  colorPrint('Checking Node.js services...', 'dim');
  const nodeServices = ['article-generation', 'video-scripter-service', 'pdf-service'];
  nodeServices.forEach(service => {
    const packagePath = join(__dirname, service, 'package.json');
    if (existsSync(packagePath)) {
      colorPrint(`  ✅ ${service} (Node.js)`, 'green');
    } else {
      colorPrint(`  ❌ ${service} not found`, 'red');
    }
  });
  console.log();

  // Check Python services
  colorPrint('Checking Python services...', 'dim');
  const pythonServices = [
    { name: 'tts-service', path: 'tts-service' },
    { name: 'video-generation-service', path: 'video-generation-service' },
  ];
  pythonServices.forEach(service => {
    const venvExists = checkPythonVenv(service.path);
    if (venvExists) {
      colorPrint(`  ✅ ${service.name} (Python venv ready)`, 'green');
    } else {
      colorPrint(`  ⚠️  ${service.name} (venv not found, run setup.sh)`, 'yellow');
    }
  });
  console.log();

  await question('\nPress Enter to continue...');
}

/**
 * List available articles
 */
async function listArticles() {
  printHeader();
  colorPrint('📁 Available Articles', 'bright');
  colorPrint('─'.repeat(70), 'dim');
  console.log();

  if (!existsSync(PATHS.articles)) {
    colorPrint('  No articles directory found.', 'yellow');
    await question('\nPress Enter to continue...');
    return [];
  }

  const files = readdirSync(PATHS.articles)
    .filter(file => file.endsWith('.md'))
    .map(file => basename(file, '.md'));

  if (files.length === 0) {
    colorPrint('  No articles found. Generate one first!', 'yellow');
    await question('\nPress Enter to continue...');
    return [];
  }

  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log();

  await question('Press Enter to continue...');
  return files;
}

/**
 * Select article from list
 */
async function selectArticle() {
  const articles = [];
  
  if (!existsSync(PATHS.articles)) {
    return null;
  }

  const files = readdirSync(PATHS.articles)
    .filter(file => file.endsWith('.md'))
    .map(file => basename(file, '.md'));

  if (files.length === 0) {
    return null;
  }

  printHeader();
  colorPrint('📁 Select Article', 'bright');
  colorPrint('─'.repeat(70), 'dim');
  console.log();

  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log();

  const choice = await question('Select article number: ');
  const index = parseInt(choice) - 1;

  if (index >= 0 && index < files.length) {
    return files[index] + '.md';
  }

  return null;
}

/**
 * Generate new article
 */
async function generateArticle() {
  printHeader();
  colorPrint('📝 Generate New Article', 'bright');
  colorPrint('─'.repeat(70), 'dim');
  console.log();

  // Check Ollama
  colorPrint('Checking Ollama service...', 'dim');
  const ollamaRunning = await checkOllamaStatus();
  if (!ollamaRunning) {
    colorPrint('  ❌ Ollama is not running!', 'red');
    colorPrint('     Please start Ollama: ollama serve', 'yellow');
    await question('\nPress Enter to continue...');
    return;
  }
  colorPrint('  ✅ Ollama is running', 'green');
  console.log();

  const topic = await question('Article topic: ');
  if (!topic.trim()) {
    colorPrint('\n❌ Topic cannot be empty!', 'red');
    await question('Press Enter to continue...');
    return;
  }

  console.log('\nTemplate types:');
  console.log('  1. educational - Educational technical article');
  console.log('  2. tutorial - Step-by-step tutorial');
  console.log('  3. deep-dive - Deep technical analysis');
  
  const skeletonChoice = await question('\nSelect template type (1-3) [1]: ');
  const skeletonMap = {
    '1': 'educational',
    '2': 'tutorial',
    '3': 'deep-dive',
    '': 'educational',
  };
  const skeleton = skeletonMap[skeletonChoice] || 'educational';

  const timeInput = await question('Reading time (minutes) [8]: ');
  const time = timeInput.trim() || '8';

  console.log();
  colorPrint('🚀 Generating article...', 'cyan');
  console.log('   This may take a few minutes. Please wait...\n');

  try {
    // Change to article-generation directory
    const articleGenDir = join(__dirname, 'article-generation');
    process.chdir(articleGenDir);

    // Run generate:single command
    const command = `npm run generate:single -- --topic "${topic.trim()}" --skeleton ${skeleton} --time ${time}`;
    execSync(command, { stdio: 'inherit' });

    colorPrint('\n✅ Article generated successfully!', 'green');
  } catch (error) {
    colorPrint('\n❌ Error generating article!', 'red');
    console.error(error.message);
  } finally {
    process.chdir(__dirname);
    await question('\nPress Enter to continue...');
  }
}

/**
 * Generate PDF
 */
async function generatePDF() {
  const articleFile = await selectArticle();
  if (!articleFile) {
    colorPrint('\n❌ No article selected!', 'red');
    await question('Press Enter to continue...');
    return;
  }

  printHeader();
  colorPrint('📄 Generating PDF...', 'cyan');
  console.log(`   Article: ${articleFile}\n`);

  try {
    const pdfServiceDir = join(__dirname, 'pdf-service');
    process.chdir(pdfServiceDir);

    const command = `npm run convert:single ${articleFile}`;
    execSync(command, { stdio: 'inherit' });

    colorPrint('\n✅ PDF generated successfully!', 'green');
  } catch (error) {
    colorPrint('\n❌ Error generating PDF!', 'red');
    console.error(error.message);
  } finally {
    process.chdir(__dirname);
    await question('\nPress Enter to continue...');
  }
}

/**
 * Generate Video Script
 */
async function generateVideoScript() {
  const articleFile = await selectArticle();
  if (!articleFile) {
    colorPrint('\n❌ No article selected!', 'red');
    await question('Press Enter to continue...');
    return;
  }

  printHeader();
  colorPrint('📋 Generating Video Script...', 'cyan');
  console.log(`   Article: ${articleFile}\n`);

  // Check Ollama
  const ollamaRunning = await checkOllamaStatus();
  if (!ollamaRunning) {
    colorPrint('  ❌ Ollama is not running!', 'red');
    colorPrint('     Please start Ollama: ollama serve', 'yellow');
    await question('\nPress Enter to continue...');
    return;
  }

  console.log('🚀 Generating script...');
  console.log('   This may take a few minutes. Please wait...\n');

  try {
    const scriptServiceDir = join(__dirname, 'video-scripter-service');
    process.chdir(scriptServiceDir);

    const command = `npm run generate:single ${articleFile}`;
    execSync(command, { stdio: 'inherit' });

    colorPrint('\n✅ Video script generated successfully!', 'green');
  } catch (error) {
    colorPrint('\n❌ Error generating script!', 'red');
    console.error(error.message);
  } finally {
    process.chdir(__dirname);
    await question('\nPress Enter to continue...');
  }
}

/**
 * Generate TTS Audio
 */
async function generateTTS() {
  printHeader();
  colorPrint('🎙️  Generate TTS Audio', 'bright');
  colorPrint('─'.repeat(70), 'dim');
  console.log();

  // List available scripts
  if (!existsSync(PATHS.scriptOutput)) {
    colorPrint('  No scripts found. Generate one first!', 'yellow');
    await question('\nPress Enter to continue...');
    return;
  }

  const scriptFiles = readdirSync(PATHS.scriptOutput)
    .filter(file => file.endsWith('.txt'));

  if (scriptFiles.length === 0) {
    colorPrint('  No scripts found. Generate one first!', 'yellow');
    await question('\nPress Enter to continue...');
    return;
  }

  console.log('Available scripts:');
  scriptFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log();

  const choice = await question('Select script number: ');
  const index = parseInt(choice) - 1;

  if (index < 0 || index >= scriptFiles.length) {
    colorPrint('\n❌ Invalid selection!', 'red');
    await question('Press Enter to continue...');
    return;
  }

  const scriptFile = scriptFiles[index];
  const scriptPath = join(PATHS.scriptOutput, scriptFile);
  const articleName = basename(scriptFile, '_script.txt');
  const outputPath = join(PATHS.ttsOutput, `${articleName}_script.wav`);

  // Check Python venv
  const ttsServiceDir = join(__dirname, 'tts-service');
  const venvExists = checkPythonVenv('tts-service');

  if (!venvExists) {
    colorPrint('\n⚠️  Python virtual environment not found!', 'yellow');
    colorPrint('     Run: cd tts-service && python3 -m venv venv && source venv/bin/activate && pip install coqui-tts', 'dim');
    await question('\nPress Enter to continue...');
    return;
  }

  printHeader();
  colorPrint('🎙️  Generating TTS Audio...', 'cyan');
  console.log(`   Script: ${scriptFile}`);
  console.log(`   Output: ${articleName}_script.wav`);
  console.log('\n   This may take several minutes. Please wait...\n');

  try {
    process.chdir(ttsServiceDir);

    const pythonCmd = join(ttsServiceDir, 'venv', 'bin', 'python');
    const command = `${pythonCmd} generate_unified.py "${scriptPath}" "${outputPath}"`;
    execSync(command, { stdio: 'inherit' });

    colorPrint('\n✅ TTS audio generated successfully!', 'green');
  } catch (error) {
    colorPrint('\n❌ Error generating TTS audio!', 'red');
    console.error(error.message);
  } finally {
    process.chdir(__dirname);
    await question('\nPress Enter to continue...');
  }
}

/**
 * Generate Video
 */
async function generateVideo() {
  printHeader();
  colorPrint('🎬 Generate Video', 'bright');
  colorPrint('─'.repeat(70), 'dim');
  console.log();

  // List available scripts
  if (!existsSync(PATHS.scriptOutput)) {
    colorPrint('  No scripts found. Generate one first!', 'yellow');
    await question('\nPress Enter to continue...');
    return;
  }

  const scriptFiles = readdirSync(PATHS.scriptOutput)
    .filter(file => file.endsWith('.txt'));

  if (scriptFiles.length === 0) {
    colorPrint('  No scripts found. Generate one first!', 'yellow');
    await question('\nPress Enter to continue...');
    return;
  }

  console.log('Available scripts:');
  scriptFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log();

  const choice = await question('Select script number: ');
  const index = parseInt(choice) - 1;

  if (index < 0 || index >= scriptFiles.length) {
    colorPrint('\n❌ Invalid selection!', 'red');
    await question('Press Enter to continue...');
    return;
  }

  const scriptFile = scriptFiles[index];
  const scriptPath = join(PATHS.scriptOutput, scriptFile);
  const articleName = basename(scriptFile, '_script.txt');
  
  // Check for corresponding audio file
  const audioFile = `${articleName}_script.wav`;
  const audioPath = join(PATHS.ttsOutput, audioFile);

  if (!existsSync(audioPath)) {
    colorPrint(`\n⚠️  Audio file not found: ${audioFile}`, 'yellow');
    colorPrint('     Please generate TTS audio first!', 'yellow');
    await question('\nPress Enter to continue...');
    return;
  }

  const outputPath = join(PATHS.videoOutput, `${articleName}.mp4`);

  // Check Python venv
  const videoServiceDir = join(__dirname, 'video-generation-service');
  const venvExists = checkPythonVenv('video-generation-service');

  if (!venvExists) {
    colorPrint('\n⚠️  Python virtual environment not found!', 'yellow');
    colorPrint('     Run: cd video-generation-service && ./setup.sh', 'dim');
    await question('\nPress Enter to continue...');
    return;
  }

  printHeader();
  colorPrint('🎬 Generating Video...', 'cyan');
  console.log(`   Script: ${scriptFile}`);
  console.log(`   Audio: ${audioFile}`);
  console.log(`   Output: ${articleName}.mp4`);
  console.log('\n   This may take several minutes. Please wait...\n');

  try {
    process.chdir(videoServiceDir);

    const generateScript = join(videoServiceDir, 'generate.sh');
    const command = `${generateScript} "${scriptPath}" "${audioPath}" "${outputPath}"`;
    execSync(command, { stdio: 'inherit' });

    colorPrint('\n✅ Video generated successfully!', 'green');
  } catch (error) {
    colorPrint('\n❌ Error generating video!', 'red');
    console.error(error.message);
  } finally {
    process.chdir(__dirname);
    await question('\nPress Enter to continue...');
  }
}

/**
 * Full Pipeline
 */
async function runFullPipeline() {
  printHeader();
  colorPrint('🚀 Full Pipeline: Article → Script → Audio → Video', 'bright');
  colorPrint('─'.repeat(70), 'dim');
  console.log();

  const articleFile = await selectArticle();
  if (!articleFile) {
    colorPrint('\n❌ No article selected!', 'red');
    await question('Press Enter to continue...');
    return;
  }

  const articleName = basename(articleFile, '.md');
  const scriptFile = `${articleName}_script.txt`;
  const audioFile = `${articleName}_script.wav`;
  const videoFile = `${articleName}.mp4`;

  printHeader();
  colorPrint('🚀 Running Full Pipeline...', 'cyan');
  console.log(`   Article: ${articleFile}`);
  console.log(`   → Script: ${scriptFile}`);
  console.log(`   → Audio: ${audioFile}`);
  console.log(`   → Video: ${videoFile}`);
  console.log();

  // Step 1: Generate Script
  colorPrint('Step 1/3: Generating video script...', 'yellow');
  try {
    const scriptServiceDir = join(__dirname, 'video-scripter-service');
    process.chdir(scriptServiceDir);
    execSync(`npm run generate:single ${articleFile}`, { stdio: 'inherit' });
    colorPrint('  ✅ Script generated', 'green');
  } catch (error) {
    colorPrint('  ❌ Error generating script!', 'red');
    process.chdir(__dirname);
    await question('\nPress Enter to continue...');
    return;
  }

  // Step 2: Generate Audio
  console.log();
  colorPrint('Step 2/3: Generating TTS audio...', 'yellow');
  try {
    const scriptPath = join(PATHS.scriptOutput, scriptFile);
    const audioPath = join(PATHS.ttsOutput, audioFile);
    const ttsServiceDir = join(__dirname, 'tts-service');
    process.chdir(ttsServiceDir);
    
    const pythonCmd = join(ttsServiceDir, 'venv', 'bin', 'python');
    execSync(`${pythonCmd} generate_unified.py "${scriptPath}" "${audioPath}"`, { stdio: 'inherit' });
    colorPrint('  ✅ Audio generated', 'green');
  } catch (error) {
    colorPrint('  ❌ Error generating audio!', 'red');
    process.chdir(__dirname);
    await question('\nPress Enter to continue...');
    return;
  }

  // Step 3: Generate Video
  console.log();
  colorPrint('Step 3/3: Generating video...', 'yellow');
  try {
    const scriptPath = join(PATHS.scriptOutput, scriptFile);
    const audioPath = join(PATHS.ttsOutput, audioFile);
    const outputPath = join(PATHS.videoOutput, videoFile);
    const videoServiceDir = join(__dirname, 'video-generation-service');
    process.chdir(videoServiceDir);
    
    const generateScript = join(videoServiceDir, 'generate.sh');
    execSync(`${generateScript} "${scriptPath}" "${audioPath}" "${outputPath}"`, { stdio: 'inherit' });
    colorPrint('  ✅ Video generated', 'green');
  } catch (error) {
    colorPrint('  ❌ Error generating video!', 'red');
    process.chdir(__dirname);
    await question('\nPress Enter to continue...');
    return;
  }

  process.chdir(__dirname);

  console.log();
  colorPrint('═'.repeat(70), 'green');
  colorPrint('✅ Full Pipeline Completed Successfully!', 'green');
  colorPrint('═'.repeat(70), 'green');
  console.log();
  colorPrint(`📁 Generated Files:`, 'bright');
  console.log(`   - Script: ${PATHS.scriptOutput}/${scriptFile}`);
  console.log(`   - Audio: ${PATHS.ttsOutput}/${audioFile}`);
  console.log(`   - Video: ${PATHS.videoOutput}/${videoFile}`);
  console.log();

  await question('Press Enter to continue...');
}

/**
 * List generated files
 */
async function listGeneratedFiles() {
  printHeader();
  colorPrint('📁 Generated Files', 'bright');
  colorPrint('─'.repeat(70), 'dim');
  console.log();

  // Articles
  colorPrint('📝 Articles:', 'cyan');
  if (existsSync(PATHS.articles)) {
    const articles = readdirSync(PATHS.articles).filter(f => f.endsWith('.md'));
    if (articles.length > 0) {
      articles.forEach(article => console.log(`   - ${article}`));
    } else {
      console.log('   (none)');
    }
  } else {
    console.log('   (directory not found)');
  }
  console.log();

  // PDFs
  colorPrint('📄 PDFs:', 'cyan');
  if (existsSync(PATHS.pdfOutput)) {
    const pdfs = readdirSync(PATHS.pdfOutput).filter(f => f.endsWith('.pdf'));
    if (pdfs.length > 0) {
      pdfs.forEach(pdf => console.log(`   - ${pdf}`));
    } else {
      console.log('   (none)');
    }
  } else {
    console.log('   (directory not found)');
  }
  console.log();

  // Scripts
  colorPrint('📋 Scripts:', 'cyan');
  if (existsSync(PATHS.scriptOutput)) {
    const scripts = readdirSync(PATHS.scriptOutput).filter(f => f.endsWith('.txt'));
    if (scripts.length > 0) {
      scripts.forEach(script => console.log(`   - ${script}`));
    } else {
      console.log('   (none)');
    }
  } else {
    console.log('   (directory not found)');
  }
  console.log();

  // Audio
  colorPrint('🎙️  Audio Files:', 'cyan');
  if (existsSync(PATHS.ttsOutput)) {
    const audioFiles = readdirSync(PATHS.ttsOutput).filter(f => f.endsWith('.wav'));
    if (audioFiles.length > 0) {
      audioFiles.forEach(audio => console.log(`   - ${audio}`));
    } else {
      console.log('   (none)');
    }
  } else {
    console.log('   (directory not found)');
  }
  console.log();

  // Videos
  colorPrint('🎬 Videos:', 'cyan');
  if (existsSync(PATHS.videoOutput)) {
    const videos = readdirSync(PATHS.videoOutput).filter(f => f.endsWith('.mp4'));
    if (videos.length > 0) {
      videos.forEach(video => console.log(`   - ${video}`));
    } else {
      console.log('   (none)');
    }
  } else {
    console.log('   (directory not found)');
  }
  console.log();

  await question('Press Enter to continue...');
}

/**
 * Main loop
 */
async function main() {
  let running = true;

  while (running) {
    printHeader();
    printMenu();

    const choice = await question('Select option (0-9): ');

    switch (choice.trim()) {
      case '1':
        await generateArticle();
        break;
      case '2':
        await generatePDF();
        break;
      case '3':
        await generateVideoScript();
        break;
      case '4':
        await generateTTS();
        break;
      case '5':
        await generateVideo();
        break;
      case '6':
        await runFullPipeline();
        break;
      case '7':
        await checkServiceStatus();
        break;
      case '8':
        await listArticles();
        break;
      case '9':
        await listGeneratedFiles();
        break;
      case '0':
        running = false;
        break;
      default:
        colorPrint('\n❌ Invalid option! Please select 0-9.', 'red');
        await question('Press Enter to continue...');
    }
  }

  console.log();
  colorPrint('👋 Thank you for using Content Production Pipeline!', 'cyan');
  console.log();
  rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});

