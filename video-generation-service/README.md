# Video Generation Service

**Professional Cinematic Educational Video Generator**

Generates high-quality, studio-grade educational videos from unified TTS + Video scripts. Creates cinematic visuals with smooth transitions, professional animations, and perfect audio-video synchronization.

## 🎯 Purpose

This service takes:
- **Unified script** (from video-scripter-service)
- **Audio file** (from tts-service)

And produces:
- **Professional cinematic video** with perfect synchronization

## Installation

### Quick Setup (Recommended)

Use the setup script to automatically create a virtual environment and install dependencies:

```bash
./setup.sh
```

### Manual Setup

If you prefer to set up manually:

1. **Create virtual environment** (required on Debian/Ubuntu systems):
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **System Dependencies**:
   
   - **FFmpeg** (required by moviepy)
     ```bash
     # Ubuntu/Debian
     sudo apt-get install ffmpeg
     
     # macOS
     brew install ffmpeg
     ```

### Using the Virtual Environment

After setup, always activate the virtual environment before running scripts:

```bash
source venv/bin/activate
```

## Usage

### Generate Single Video

**Option 1: Using convenience script (Recommended)**

```bash
./generate.sh <script_path> <audio_path> <output_path>
```

**Example:**
```bash
./generate.sh \
  ../video-scripter-service/output/what-is-it-javascript_script.txt \
  ../tts-service/out/what-is-it-javascript_script.wav \
  output/video.mp4
```

**Option 2: Manual activation**

```bash
# Activate virtual environment
source venv/bin/activate

# Generate video
python src/generateSingle.py <script_path> <audio_path> <output_path>
```

**Option 3: Direct virtual environment Python**

```bash
venv/bin/python src/generateSingle.py <script_path> <audio_path> <output_path>
```

## Features

### 🎬 Professional Visual Quality

- **Studio-grade visuals**: Clean, modern, professional appearance
- **Cinematic color palette**: Blue/teal tech tones with gradients
- **Smooth animations**: Professional motion graphics
- **Soft shadows & depth**: Layered compositions with depth

### 🎥 Visual Elements

- **Code Editor Mockups**: Professional code blocks with syntax highlighting
- **Title Cards**: Clean, animated title cards with geometric shapes
- **Diagrams**: Minimal, animated flowcharts and visualizations
- **Text Overlays**: Clean typography for summaries and CTAs
- **Camera Movements**: Pan, zoom, tilt effects

### ✨ Transitions & Animations

- **Smooth cross-fades** between scenes
- **Slide transitions** for dynamic flow
- **Fade-in effects** for scene entrances
- **Natural pacing** with professional timing

### 🎨 Professional Style

- **Similar to Google Dev videos or Fireship style**
- **Friendly, clean, educational tone**
- **Slightly futuristic but not overwhelming**
- **No goofy or cartoonish visuals**

## Video Specifications

- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 FPS
- **Aspect Ratio**: 16:9 (configurable per scene)
- **Codec**: H.264 (libx264)
- **Audio Codec**: AAC
- **Bitrate**: 8000k (high quality)

## Scene Types Supported

### 1. Code Editor Scenes
- Dark/light mode code editors
- Syntax highlighting
- Line-by-line animations
- Cursor typing effects

### 2. Title Card Scenes
- Modern title cards
- Geometric shapes
- Smooth fade-ins
- Professional typography

### 3. Diagram Scenes
- Flowcharts
- Node connections
- Animated arrows
- Minimal, clean design

### 4. Text Overlay Scenes
- Bullet points
- Summary screens
- Clean typography
- Subtle animations

## Color Palette

Professional tech color scheme:
- **Primary**: Blue (#3B82F6)
- **Accent**: Teal (#14B8A6)
- **Backgrounds**: Dark navy gradients or light gray
- **Text**: High contrast for readability
- **Code**: Syntax-highlighted with professional colors

## Project Structure

```
video-generation-service/
├── src/
│   ├── unifiedScriptParser.py      # Parse unified script format
│   ├── sceneRenderer.py            # Render individual scenes
│   ├── professionalVideoGenerator.py  # Main video generator
│   └── generateSingle.py           # CLI script
├── output/                         # Generated videos
├── requirements.txt
└── README.md
```

## Workflow

### Complete Pipeline

```bash
# 1. Generate unified script
cd ../video-scripter-service
npm run generate:single article.md

# 2. Generate audio
cd ../tts-service
python generate_single.py ../video-scripter-service/output/article_script.txt

# 3. Generate video
cd ../video-generation-service
python src/generateSingle.py \
  ../video-scripter-service/output/article_script.txt \
  ../tts-service/out/article_script.wav \
  output/video.mp4
```

## Technical Details

### Unified Script Format

The service expects unified scripts with scene-by-scene structure:
- `narration`: Text for TTS
- `visual`: Detailed visual description
- `duration`: Scene duration in seconds
- `video_settings`: Camera, mood, animation, background
- `code`: Optional code blocks
- `transitions`: Scene transitions

### Scene Rendering

Each scene is rendered with:
1. **Base frame**: Background and static elements
2. **Camera movements**: Zoom, pan, tilt
3. **Animations**: Fade-ins, transitions
4. **Visual elements**: Code, diagrams, text overlays

### Audio-Video Synchronization

- Video frames generated based on audio duration
- Proportional timing across scenes
- Smooth transitions between scenes
- Perfect audio-video sync

## Performance

- **Processing time**: ~2-3x video duration
- **Memory usage**: Moderate (depends on video length)
- **Output file size**: ~50-100 MB per minute (8Mbps bitrate)

## Customization

### Modify Colors

Edit `COLORS` dictionary in `src/sceneRenderer.py`:
```python
COLORS = {
    'primary': (59, 130, 246),  # Change primary color
    'accent': (20, 184, 166),   # Change accent color
    # ... more colors
}
```

### Adjust Quality

Edit video settings in `generate_professional_video()`:
```python
final_video.write_videofile(
    output_path,
    fps=fps,
    bitrate='8000k',  # Increase for higher quality
    preset='medium',   # 'fast', 'medium', 'slow'
)
```

### Add Custom Transitions

Extend `create_transition_frames()` in `professionalVideoGenerator.py`:
```python
elif transition_type == "your_transition":
    # Your custom transition code
    pass
```

## Troubleshooting

### FFmpeg Not Found
```bash
# Install FFmpeg
sudo apt-get install ffmpeg  # Ubuntu/Debian
brew install ffmpeg           # macOS
```

### Memory Issues
- Reduce video resolution in `sceneRenderer.py` (VIDEO_WIDTH, VIDEO_HEIGHT)
- Reduce bitrate in `professionalVideoGenerator.py`

### Slow Rendering
- Use `preset='fast'` for faster encoding
- Reduce frame rate to 24 FPS
- Reduce video resolution

## License

MIT

## Credits

Built for professional educational video production with cinematic quality.
