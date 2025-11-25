# Video Scripter Service

**Unified TTS + Video Script Generation Service**

Converts markdown articles into professional unified scripts that work seamlessly with both **TTS (Text-to-Speech)** and **Video Generation** services. One script file → Audio + Video production pipeline.

## 🎯 Purpose

This service generates a **single, unified script format** that contains:
- **Narration text** for TTS service (clean, spoken language)
- **Visual descriptions** for video generation service (detailed, specific)
- **Timing & settings** for perfect synchronization
- **Code blocks, transitions, assets** - everything needed for production

**Result**: Professional educational videos from a single markdown article.

## Installation

```bash
npm install
```

## Prerequisites

- Ollama must be running: `ollama serve`
- DeepSeek R1 model must be installed: `ollama pull deepseek-r1:14b`

## Usage

### Generate Scripts for All Articles

Converts all markdown files in `article-generation/articles` directory:

```bash
npm run generate
```

### Generate Script for Single Article

Converts a specific markdown file:

```bash
npm run generate:single what-is-it-javascript.md
```

### Generate Script with Type Override

You can override the auto-detected article type:

```bash
npm run generate:single solid.md tutorial
```

Valid types: `educational`, `tutorial`, `deep_dive`

## Output

Unified scripts are saved in the `output/` directory with the format: `<filename>_script.txt`

## 📋 Unified Script Format

The generated script follows a scene-by-scene structure optimized for both TTS and Video generation:

```
---
[scene 1]

narration: |
  This is the exact text that TTS service will read aloud.
  Written in natural, spoken language style.
  No markdown, no headers, just pure narration.

visual: |
  Detailed description of what video-generation service should create.
  Very specific: colors, animations, layout, camera angle.
  Describe exactly what appears on screen.

duration: "8s"

tts_settings:
  speed: 1.05
  tone: "Educational and energetic"
  pauses:
    - "300ms after introduction"

video_settings:
  camera: "static front"
  mood: "modern, clean, minimal"
  animation: "code blocks fade in smoothly"
  background: "dark gradient"

ratio: "16:9"

code:
  read_aloud: false
  content: |
    console.log("Hello JS");

transitions:
  next: "Now let's move to functions."

assets:
  music: "soft-tech"
  icons: ["variable-icon"]
---

[scene 2]
...
```

### Format Components

Each scene contains:

1. **`narration`** - Pure text for TTS (no markdown)
2. **`visual`** - Detailed description for video generation
3. **`duration`** - Exact scene duration (e.g., "8s", "15s")
4. **`tts_settings`** - Speed, tone, pauses for audio
5. **`video_settings`** - Camera, mood, animation, background
6. **`ratio`** - Video aspect ratio (16:9 or 9:16)
7. **`code`** (optional) - Code blocks with read_aloud flag
8. **`transitions`** - Smooth connections between scenes
9. **`assets`** (optional) - Music, icons, diagrams

## 🎬 Scene Structure

Scripts are broken into logical scenes:

### 1. HOOK Scene (~8-12s)
- Attention-grabbing opening
- Question or interesting statement
- Visual: Text animation or graphics

### 2. INTRO Scene (~12-25s)
- Topic introduction
- Learning goals preview
- Visual: Title cards, geometric shapes

### 3. MAIN CONTENT Scenes (~15s each)
- Core educational content
- Mix of code, diagrams, animations
- Multiple scenes covering concepts

### 4. EXAMPLE Scene (~10-15s)
- Complete practical example
- Code block with typing animation
- Synchronous explanation

### 5. SUMMARY Scene (~8-10s)
- Key takeaways recap
- Bullet points appearing one by one
- Visual: Clean text display

### 6. CTA Scene (~8-10s)
- Encourage practice
- Mention resources
- Motivating conclusion

## ⏱️ Duration Guidelines

Each article type has target durations:

### Educational Videos (Target: 90 seconds)
- Total scenes: ~11 scenes
- Speaking rate: 2.5 words/second
- Total words: ~225 words

### Tutorial Videos (Target: 120 seconds)
- Total scenes: ~13 scenes
- Speaking rate: 2.5 words/second
- Total words: ~300 words

### Deep Dive Videos (Target: 180 seconds)
- Total scenes: ~17 scenes
- Speaking rate: 2.3 words/second
- Total words: ~414 words

## 🎯 Key Features

### ✅ Unified Format
- **Single file** works for both TTS and Video generation
- No need to parse multiple formats
- Direct pipeline: Article → Script → Audio + Video

### ✅ Professional Quality
- Natural spoken language (not written style)
- Very specific visual descriptions
- Perfect timing synchronization
- Smooth scene transitions

### ✅ Complete Specifications
- TTS settings (speed, tone, pauses)
- Video settings (camera, mood, animation)
- Code handling (read aloud or not)
- Asset requirements (music, icons, diagrams)

### ✅ Zero Gaps
- Every second accounted for
- Precise duration calculations
- Smooth transitions between scenes

## 📊 Using Generated Script

### For TTS Service

The `narration` field in each scene contains clean text ready for TTS:
- No markdown formatting
- Natural spoken language
- Proper pauses specified in `tts_settings`

Example workflow:
```bash
# Extract narration from unified script
# Use with TTS service
python tts-service/generate_single.py script.txt
```

### For Video Generation Service

The `visual` field in each scene contains detailed descriptions:
- Specific colors and layouts
- Animation types and timing
- Camera movements
- Background styles

Example workflow:
```bash
# Parse unified script
# Generate video frames based on visual descriptions
python video-generation-service/generate_single.py script.txt audio.wav
```

### Combined Workflow

```bash
# 1. Generate unified script
npm run generate:single article.md

# 2. Generate audio from narration
python tts-service/generate_single.py output/article_script.txt

# 3. Generate video from visual descriptions + audio
python video-generation-service/generate_single.py output/article_script.txt tts-service/out/article_script.wav
```

## 🔧 Technical Details

### Visual Types

The `video_settings.animation` field specifies visual type:
- **code_block**: Syntax-highlighted code with typing animation
- **diagram**: Visual diagrams, flowcharts, schemas
- **containers**: Geometric shapes, boxes, containers
- **animation**: Motion graphics, animated explanations
- **text_display**: Text overlays, bullet points, key terms

### Code Handling

Code blocks can be:
- **Shown only** (`read_aloud: false`) - Code appears on screen, not read
- **Read aloud** (`read_aloud: true`) - Code is read by narrator
- Usually `false` for better flow

### Settings Guidelines

**TTS Settings**:
- Speed: 0.9-1.2 (default: 1.05)
- Tone: "Educational and energetic", "Calm and professional", etc.
- Pauses: Natural breaks for better narration flow

**Video Settings**:
- Camera: "static front", "zoom in", "pan right", etc.
- Mood: "modern, clean, minimal", "warm, inviting", etc.
- Animation: Specific animation descriptions
- Background: "dark gradient", "light code editor", etc.

## Article Type Detection

The service automatically detects article type by analyzing:
- Filename keywords
- Content keywords
- Article structure

You can override the detected type by providing it as a second argument.

## Project Structure

```
video-scripter-service/
├── src/
│   ├── index.js              # Main script (converts all articles)
│   ├── generateSingle.js     # Single file converter
│   ├── scriptGenerator.js    # Core script generation service
│   ├── llm/
│   │   └── callOllama.js     # Ollama API integration
│   ├── prompts/
│   │   └── buildScriptPrompt.js  # Unified prompt builder
│   └── utils/
│       └── articleReader.js  # Article reading and type detection
├── output/                   # Generated unified scripts
└── package.json
```

## Environment Variables

- `OLLAMA_URL` - Ollama API URL (default: `http://localhost:11434`)
- `OLLAMA_MODEL` - Model name (default: `deepseek-r1:14b`)

## Benefits

✅ **Single Source of Truth**: One script file for both audio and video  
✅ **Perfect Synchronization**: Timing ensures audio-video sync  
✅ **Professional Quality**: Detailed specifications for production  
✅ **Easy Integration**: Direct pipeline with TTS and Video services  
✅ **Zero Gaps**: Every second planned and accounted for  
✅ **Flexible**: Works with different video formats (16:9, 9:16)

## Example Output

See `output/what-is-it-javascript_script.txt` for a complete example of the unified script format.
