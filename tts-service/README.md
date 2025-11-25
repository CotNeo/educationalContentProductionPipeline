# XTTS v2 Voice Cloning & British English Narration Pipeline

A complete local voice cloning and text-to-speech pipeline using **XTTS v2** for generating British English narration for YouTube education videos.

## 🎯 Features

- Clone your voice using XTTS v2
- Generate **British English** narration
- Automate scene-by-scene `.wav` output generation
- **Automatic script cleaning** - Removes video script headers (HOOK, INTRO, MAIN CONTENT, etc.) and markdown formatting
- Everything runs **locally** (no API calls)

## 📦 Installation

### Prerequisites (Ubuntu/macOS)

```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip -y
```

### Setup Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Coqui TTS
pip install coqui-tts
```

### Make Scripts Executable

```bash
chmod +x generate_scenes.sh
```

## 📁 Project Structure

```
project/
  voice/
    furkanforenglish.wav    # Your reference voice file
  script/
    narration_scene1.txt    # Scene narration text files
    narration_scene2.txt
    narration_scene3.txt
  out/                       # Generated WAV files
  utils/
    script_cleaner.py        # Script cleaning utility (removes headers & markdown)
  generate_scenes.sh         # Batch generation script
  generate_single.py         # Single scene generator
  generate_optimized.py      # Optimized generator with max voice similarity
  README.md
```

## 🚀 How to Use

### Method 1: Generate from Unified Script (Recommended)

Generate audio from unified TTS + Video script format:

```bash
source venv/bin/activate

python generate_unified.py <unified_script_path> <output.wav>
```

**Example:**
```bash
python generate_unified.py \
  ../video-scripter-service/output/what-is-it-javascript_script.txt \
  out/what-is-it-javascript_script.wav
```

**Features:**
- Automatically extracts narration from all scenes
- Uses TTS settings from script (speed, tone, pauses)
- Handles unified script format seamlessly

### Method 2: Generate All Scenes (Batch)

1. Place DeepSeek-generated narration files into:
   ```
   project/script/narration_scene1.txt
   project/script/narration_scene2.txt
   project/script/narration_scene3.txt
   ```

2. Activate virtual environment:
   ```bash
   source venv/bin/activate
   ```

3. Generate all audio files:
   ```bash
   ./generate_scenes.sh
   ```

4. Output WAV files will appear in:
   ```
   project/out/narration_scene1.wav
   project/out/narration_scene2.wav
   project/out/narration_scene3.wav
   ```

### Method 3: Generate Single Scene (Direct Text)

```bash
source venv/bin/activate

python generate_single.py "Your narration text here" output.wav
```

## 🇬🇧 British English Optimization

To get clearer British English output with Received Pronunciation, shape your text like:

```
Speak in clear British English, Received Pronunciation. Narration: [Your actual narration text here]
```

Example:
```
Speak in clear British English, Received Pronunciation. Narration: Welcome to today's educational video. We'll explore the fascinating world of machine learning and artificial intelligence.
```

## 🔧 Troubleshooting

### Model Download
On first run, XTTS v2 model will be automatically downloaded. This may take several minutes depending on your internet connection.

### Voice File Location
Ensure `furkanforenglish.wav` is located in the `voice/` directory.

### Virtual Environment
Always activate the virtual environment before running scripts:
```bash
source venv/bin/activate
```

## 📝 Notes

- The first generation may take longer as the model loads
- Generated WAV files are saved in the `out/` directory
- Each scene file should contain the complete narration text for that scene
- The system uses XTTS v2 multilingual model for high-quality voice cloning
- **Script cleaning is automatic**: Video script headers (HOOK, INTRO, MAIN CONTENT, EXAMPLE, SUMMARY, CTA) and markdown formatting are automatically removed before TTS generation

## 🎤 Voice Cloning Tips

- Use a clear, high-quality reference audio file
- Reference audio should be at least 3-5 seconds long (20+ seconds recommended for best results)
- Speak naturally in the reference audio for best results
- British English pronunciation will be applied to all generated audio
- Record in a quiet environment with minimal background noise
- Use a quality microphone for the reference recording

## 🎯 Maximum Voice Similarity (Optimized Mode) - Maksimum Ses Benzerliği

Sesinizin **birebir aynı** çıkması için optimize edilmiş script'i kullanın:

```bash
source venv/bin/activate

python generate_optimized.py "Your narration text here" output.wav
```

**VEYA** batch işlem için (tüm sahneleri optimize edilmiş modda üretir):

```bash
./generate_scenes.sh
```

### Optimized Parameters

The optimized script uses these settings for maximum voice similarity:

- **gpt_cond_len: 30** - Longer conditioning for better voice capture
- **gpt_cond_chunk_len: 4** - Optimal chunk size for conditioning
- **temperature: 0.7** - Lower temperature for more consistent voice
- **repetition_penalty: 5.0** - Prevents unwanted repetition
- **max_ref_len: 10** - Uses more of your reference audio
- **top_k: 50, top_p: 0.85** - Sampling parameters for quality
- **length_penalty: 1.0** - Natural speech length
- **speed: 1.0** - Normal speech speed

### Performance Notes

- First generation loads the model (may take 1-2 minutes)
- GPU acceleration recommended for faster generation
- CPU mode available with `--cpu` flag (slower but works on all systems)

