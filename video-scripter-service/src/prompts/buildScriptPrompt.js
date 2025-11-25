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
  CRITICAL: Very detailed description of what video-generation service should create.
  MUST be extremely specific and include:
  1. Exact component/technology/concept names that appear (for diagrams: MongoDB, Express.js, React, Node.js, etc.)
  2. Colors, animations, layout, camera angle, transitions
  3. For diagrams: Explicitly name each box/circle/component (e.g., "MongoDB", "Express.js", "React", "Node.js")
  4. For code: Mention "code snippet" or "code block" with "syntax highlighting"
  5. For text: Mention "bullet points", "infographic", or "text overlay"
  6. Describe exactly what appears on screen, matching the narration content
  
  Example: "Flowchart animation showing data moving from MongoDB to Express.js to React to Node.js. Each component appears as a labeled blue box connected by arrows. Arrows highlight paths as they are mentioned."
  
  Example: "Dark blue gradient background. White code block appears from left with syntax highlighting showing Express.js route code. Each line animates in as narrator speaks."
  
  Example: "Four interconnected circles representing MongoDB, Express.js, React, and Node.js appear on screen. Each circle highlights in blue as the corresponding technology name is spoken."

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

## 🎬 VISUAL TYPES - CRITICAL FORMATTING RULES

The video generation service recognizes these EXACT visual description patterns. Use these keywords in your visual descriptions:

### ✅ STANDARD VISUAL PATTERNS (Use these exact keywords):

1. **CODE SCENES** - Must include:
   - Keywords: "code", "code snippet", "code block", "syntax highlighting"
   - Example: "Code snippet appears on screen with syntax highlighting. Camera zooms into the code as it lights up line by line."
   - Format: Use code.content: section for actual code (or nested code: structure)

2. **DIAGRAM/FLOWCHART SCENES** - Must include:
   - Keywords: "diagram", "flowchart", "circles", "panels", "scale", "arrows", "flow"
   - CRITICAL: In visual description, explicitly name the components/entities that appear in the diagram
   - Example: "Flowchart animation showing data moving from MongoDB to Express.js to React to Node.js. Arrows highlight paths as they are mentioned."
   - Example: "Four interconnected circles representing MongoDB, Express.js, React, and Node.js appear on screen. Each circle highlights in blue as the corresponding technology name is spoken."
   - Example: "Diagram showing User Request → Express.js → MongoDB → Response flow. Each step appears as a labeled box connected by arrows."
   - IMPORTANT: Name specific technologies, components, or concepts in the visual description so the diagram can extract them correctly

3. **TEXT OVERLAY/BULLET SCENES** - Must include:
   - Keywords: "bullet points", "infographic", "tips", "optimization", "text overlay", "list"
   - Example: "Infographic appears showing optimization tips in bullet points. Camera zooms into each point as it is highlighted."

4. **TITLE CARD SCENES** - Must include:
   - Keywords: "title card", "title", "card"
   - Example: "Bright title card with geometric shapes in blue and white on a light background."

5. **LOGO/ANIMATION SCENES** - Must include:
   - Keywords: "logo", "animated logo", "animated text" (for text animations)
   - Example: "Animated JavaScript logo with glowing effects on a dark background."
   - Example: "Dark gradient background with animated 'MERN' text appearing in white letters."

6. **SCREENSHOT/IMAGE SCENES** - Must include:
   - Keywords: "screenshot", "image", "app", "screenshots"
   - Example: "Screenshots of popular apps appear on screen with their key features highlighted."

7. **CALL-TO-ACTION SCENES** - Must include:
   - Keywords: "call-to-action", "button", "CTA"
   - Example: "Screen fades out to a call-to-action button that says 'Learn More'."

### ❌ AVOID Vague Descriptions:
- ❌ "Visual elements appear" (too vague)
- ❌ "Graphics show on screen" (not specific)
- ✅ "Code block appears with syntax highlighting" (specific)
- ✅ "Flowchart diagram showing data flow" (specific)

### 📋 VISUAL DESCRIPTION TEMPLATES:

**For Code:**
Example: "Code snippet appears on screen with syntax highlighting. Camera zooms into the code as it lights up line by line."

**For Diagrams:**
Example: "Flowchart animation showing data moving from [Component1] to [Component2] to [Component3]. Arrows highlight paths as they are mentioned."
OR
Example: "[Number] interconnected circles representing [Component1], [Component2], [Component3], [Component4] appear on screen. Each circle highlights in blue as the corresponding technology name is spoken."
OR
Example: "Diagram showing [Step1] → [Step2] → [Step3] flow. Each step appears as a labeled box connected by arrows."
CRITICAL: Always explicitly name the components, technologies, or steps in the visual description. The video generator extracts these names to create the diagram.

**For Text/Bullets:**
Example: "Infographic appears showing [topic] tips in bullet points. Camera zooms into each point as it is highlighted."

**For Title Cards:**
Example: "Bright title card with [colors] on a [light/dark] background. Text '[Title]' fades in one by one."

**For Logos/Animations:**
Example: "Animated [Topic] logo with glowing effects on a dark background."
OR
Example: "Dark gradient background with animated '[TEXT]' text appearing in white letters from left to right."

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

3. **Visual (for Video Generation)** - CRITICAL:
   - MUST use standard keywords from VISUAL TYPES section above
   - Include: colors, layout, animations, timing, camera movements
   - Use exact patterns: "code snippet", "flowchart", "bullet points", "title card", "logo", etc.
   - Example for code: "Code snippet appears on screen with syntax highlighting..."
   - Example for diagram: "Flowchart animation showing data moving from X to Y..."
   - Example for bullets: "Infographic appears showing tips in bullet points..."
   - Clear enough for automated video generation service to recognize and render correctly

4. **Code Handling**:
   - Extract all code examples from article
   - Use code.content: format (simpler, preferred):
     code.content: |
       [markdown code block with language tag]
       // Your code here
       console.log("example");
       [end code block]
   - OR use nested format:
     code:
       read_aloud: false
       content: |
         // Your code here
         console.log("example");
   - In visual section, MUST include keywords: "code", "code snippet", "syntax highlighting"
   - Set read_aloud: false if using nested format (code is shown, not read)

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
