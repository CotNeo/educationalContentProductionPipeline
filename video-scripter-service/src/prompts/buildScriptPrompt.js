/**
 * Video script prompt builder module.
 * Creates prompts for converting articles to unified TTS + Video scripts.
 * Unified format that works for both TTS and Video generation services.
 */

/**
 * Builds system prompt for unified TTS + Video script generation.
 * @param {string} articleType - Article type: 'educational', 'tutorial', or 'deep_dive'
 * @returns {string} System prompt
 */
export function buildSystemPrompt(articleType) {
  console.log(`[buildScriptPrompt] Building unified TTS+Video system prompt for type: ${articleType}`);

  // Duration requirements based on type (in seconds)
  const durationMap = {
    educational: { min: 60, max: 120, target: 90 },
    tutorial: { min: 90, max: 180, target: 120 },
    deep_dive: { min: 120, max: 300, target: 180 },
  };

  const duration = durationMap[articleType] || durationMap.educational;
  const targetDuration = duration.target;

  // Speaking rate based on article type
  const speakingRate = articleType === 'deep_dive' ? 2.3 : 2.5;

  const systemPrompt = `You are an AI unified script generator specialized in creating professional educational video scripts.

Your task is to convert article content into a UNIFIED SCRIPT FORMAT that works seamlessly for both:
1. TTS (Text-to-Speech) Service - for audio generation
2. Video Generation Service - for visual content creation

## 🎯 CRITICAL REQUIREMENTS

- Generate scene-by-scene breakdowns with EXACT specifications
- Each scene MUST have narration (for TTS) and visual (for video generation)
- Zero gaps - every second must be accounted for
- Professional, engaging, and educational content
- Clear separation between narration text and visual descriptions

## 📋 OUTPUT FORMAT - UNIFIED TTS + VIDEO SCRIPT

You MUST output the script in this EXACT format. Every scene follows this structure:

---

[scene N]

narration: |
  This is the exact text that TTS service will read aloud.
  Write it in natural, spoken language style.
  Short sentences (max 15 words).
  Conversational and engaging.
  NO markdown formatting, NO headers, NO brackets.

visual: |
  Detailed description of what video-generation service should create.
  Be VERY specific: colors, animations, layout, camera angle, transitions.
  Describe exactly what appears on screen.
  Example: "Dark blue gradient background. White code block appears from left with syntax highlighting. Each line animates in as narrator speaks."

duration: "Xs"
  Specify exact duration for this scene (e.g., "8s", "15s", "4.5s")
  Total must add up to ${targetDuration} seconds

tts_settings:
  speed: X.XX
    TTS reading speed (0.9-1.2, default 1.05)
  tone: "Description"
    Tone description: "Educational and energetic", "Calm and professional", etc.
  pauses:
    - "300ms after introduction"
    - "500ms before code block"
    Specify natural pauses for better narration flow

video_settings:
  camera: "static front" | "zoom in" | "pan right" | etc.
    Camera movement/position
  mood: "modern, clean, minimal" | "warm, inviting" | etc.
    Overall visual mood
  animation: "code blocks fade in smoothly" | "diagrams slide from top" | etc.
    Specific animation style for this scene
  background: "dark gradient" | "light code editor" | "geometric shapes" | etc.
    Background style

ratio: "16:9" | "9:16"
  Video aspect ratio (default: 16:9 for educational, 9:16 for social media)

code:
  read_aloud: true | false
    Whether TTS should read the code (false for most cases)
  content: |
    // Code block here
    console.log("example");
    Only include if this scene has code to display

transitions:
  next: "Natural transition sentence to next scene"
    Smooth connecting sentence/phrase

assets:
  music: "soft-tech" | "energetic" | "none" | etc.
    Background music style (optional)
  icons: ["variable-icon", "function-icon"]
    Icon names if needed (optional)
  diagram: "scope-diagram" | "flow-chart" | etc.
    Diagram type if needed (optional)

---

## 📐 SCENE BREAKDOWN GUIDELINES

Break the article content into logical scenes:

1. **HOOK Scene** (0-${Math.round(targetDuration * 0.09)}s)
   - Grab attention immediately
   - Pose question or interesting statement
   - Visual: Text animation or attention-grabbing graphics

2. **INTRO Scene** (${Math.round(targetDuration * 0.09)}-${Math.round(targetDuration * 0.22)}s)
   - Introduce topic and learning goals
   - Preview what will be covered
   - Visual: Title cards, geometric shapes, preview animations

3. **MAIN CONTENT Scenes** (${Math.round(targetDuration * 0.22)}-${Math.round(targetDuration * 0.78)}s)
   - Break into ${Math.ceil((targetDuration * 0.56) / 15)} scenes of ~15 seconds each
   - Each scene covers one major concept
   - Mix of code blocks, diagrams, animations, text displays
   - Smooth transitions between concepts

4. **EXAMPLE Scene** (${Math.round(targetDuration * 0.78)}-${Math.round(targetDuration * 0.89)}s)
   - Complete, practical example
   - Code block with typing animation
   - Explain synchronously with narration

5. **SUMMARY Scene** (${Math.round(targetDuration * 0.89)}-${Math.round(targetDuration * 0.98)}s)
   - Recap 3-4 key points
   - Bullet points appearing one by one
   - Visual: Clean text display

6. **CTA Scene** (${Math.round(targetDuration * 0.98)}-${targetDuration}s)
   - Encourage practice
   - Mention resources
   - Motivating conclusion

## ✅ FORMAT RULES

1. **Narration**: 
   - Pure text, NO markdown
   - Natural spoken language
   - NO brackets, NO headers, NO meta-commentary
   - Word count must match duration × ${speakingRate} words/sec

2. **Visual**:
   - VERY specific descriptions
   - Describe EXACTLY what appears
   - Include colors, positions, animations, timing
   - Clear enough for video generation service

3. **Duration**:
   - Format: "Xs" where X is seconds
   - Decimals allowed: "4.5s"
   - All scenes must sum to ${targetDuration}s

4. **Code**:
   - Only include if scene has code
   - Complete, runnable code
   - Syntax highlighting mentioned in visual description
   - read_aloud usually false (code is shown, not read)

5. **Transitions**:
   - Natural connecting phrases
   - Smooth flow between scenes
   - Can be part of narration or separate

## 🎬 VISUAL TYPES

Specify visual type in video_settings.animation:
- **code_block**: Syntax-highlighted code with typing animation
- **diagram**: Visual diagrams, flowcharts, schemas
- **containers**: Geometric shapes, boxes, containers
- **animation**: Motion graphics, animated explanations
- **text_display**: Text overlays, bullet points, key terms

## 📊 QUALITY CHECKLIST

Before outputting, verify:
- [ ] Total duration = ${targetDuration}s (sum of all scenes)
- [ ] Every scene has narration AND visual
- [ ] Narration is natural, spoken language (NO markdown)
- [ ] Visual descriptions are VERY specific
- [ ] Code blocks are complete and runnable (if present)
- [ ] Smooth transitions between scenes
- [ ] TTS settings are appropriate for each scene
- [ ] Video settings specify exact visual requirements
- [ ] NO gaps, NO empty time

Output ONLY the unified script format. Start with [scene 1] and continue sequentially.`;

  return systemPrompt;
}

/**
 * Builds user prompt with article content for unified TTS + Video script generation.
 * @param {string} articleContent - Full article markdown content
 * @param {string} articleType - Article type: 'educational', 'tutorial', or 'deep_dive'
 * @param {string} articleTitle - Article title (optional)
 * @returns {string} User prompt
 */
export function buildUserPrompt(articleContent, articleType, articleTitle = '') {
  console.log(`[buildScriptPrompt] Building unified TTS+Video user prompt for type: ${articleType}`);

  // Duration requirements
  const durationMap = {
    educational: 90,
    tutorial: 120,
    deep_dive: 180,
  };
  const targetDuration = durationMap[articleType] || 90;
  const speakingRate = articleType === 'deep_dive' ? 2.3 : 2.5;

  // Extract title from content if not provided
  let title = articleTitle;
  if (!title) {
    const titleMatch = articleContent.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  // Extract key sections from article for better context
  const sections = extractArticleSections(articleContent);

  const userPrompt = `# 🎬 UNIFIED TTS + VIDEO SCRIPT GENERATION

## 📊 Article Information

- **Type**: ${articleType}
${title ? `- **Title**: ${title}\n` : ''}
- **Target Duration**: ${targetDuration} seconds (${Math.round(targetDuration / 60)} minutes)
- **Speaking Rate**: ${speakingRate} words/second
- **Total Word Count Target**: ~${Math.round(targetDuration * speakingRate)} words

## 📑 Article Structure Analysis

${sections.length > 0 
  ? sections.map((section, i) => `- **Section ${i + 1}**: "${section.title}" (${section.lineCount} lines)`)
    .join('\n')
  : '- Single article structure'
}

## 📝 Full Article Content

<article_content>
${articleContent}
</article_content>

---

## 🎯 Your Task

Convert the above article into a **UNIFIED TTS + VIDEO SCRIPT** following the exact format specified in system instructions.

### Key Requirements:

1. **Scene Breakdown**:
   - Break content into logical scenes (~${Math.ceil((targetDuration * 0.56) / 15)} MAIN scenes + HOOK + INTRO + EXAMPLE + SUMMARY + CTA)
   - Each scene: ${Math.round(15 * speakingRate)}-${Math.round(20 * speakingRate)} words
   - Total: ~${Math.round(targetDuration * speakingRate)} words across all scenes

2. **Narration (for TTS)**:
   - Rewrite in natural, spoken language
   - NO markdown, NO headers, NO code blocks in narration
   - Short, conversational sentences
   - Word count matches duration × ${speakingRate} words/sec

3. **Visual (for Video Generation)**:
   - VERY specific descriptions of what appears on screen
   - Include: colors, layout, animations, timing, camera movements
   - Describe code blocks, diagrams, text overlays in detail
   - Clear enough for automated video generation

4. **Code Handling**:
   - Extract all code examples from article
   - Include in \`code.content\` section
   - Set \`read_aloud: false\` (code is shown, not read)
   - Describe code appearance in \`visual\` section

5. **Timing**:
   - Calculate exact duration for each scene
   - Sum must equal ${targetDuration}s
   - Distribution:
     - HOOK: ~${Math.round(targetDuration * 0.09)}s
     - INTRO: ~${Math.round(targetDuration * 0.13)}s
     - MAIN: ~${Math.round(targetDuration * 0.56)}s (${Math.ceil((targetDuration * 0.56) / 15)} scenes)
     - EXAMPLE: ~${Math.round(targetDuration * 0.11)}s
     - SUMMARY: ~${Math.round(targetDuration * 0.09)}s
     - CTA: ~${Math.round(targetDuration * 0.08)}s

6. **Settings**:
   - **tts_settings**: Appropriate speed, tone, pauses for each scene
   - **video_settings**: Specific camera, mood, animation, background
   - **ratio**: Default 16:9 (or 9:16 if specified)
   - **transitions**: Smooth connecting phrases between scenes

## ✅ Output Format

Start with:

---

[scene 1]

narration: |
  [Your narration text here]

visual: |
  [Your visual description here]

duration: "Xs"
...

Continue sequentially through all scenes.

Total scenes: ~${Math.ceil((targetDuration * 0.56) / 15) + 5} scenes
Total duration: EXACTLY ${targetDuration}s

Generate the complete unified script NOW.`;

  return userPrompt;
}

/**
 * Extracts key sections from article content for context.
 * @param {string} content - Article markdown content
 * @returns {Array} Array of section objects with title and line count
 */
function extractArticleSections(content) {
  const sections = [];
  const lines = content.split('\n');
  
  let currentSection = null;
  let lineCount = 0;
  
  for (const line of lines) {
    // Check for heading (## or ###)
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    
    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        sections.push({
          title: currentSection,
          lineCount: lineCount
        });
      }
      
      // Start new section
      currentSection = headingMatch[1].trim();
      lineCount = 0;
    } else if (currentSection && line.trim()) {
      lineCount++;
    }
  }
  
  // Add last section
  if (currentSection) {
    sections.push({
      title: currentSection,
      lineCount: lineCount
    });
  }
  
  return sections.slice(0, 8); // Limit to first 8 sections
}
