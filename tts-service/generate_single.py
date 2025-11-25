"""
Single scene TTS generation script using XTTS v2.
Generates British English narration from text using cloned voice.
Optimized for maximum voice similarity and quality.
"""
from TTS.api import TTS
import sys
import os
import torch

# Import script cleaner utility
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.script_cleaner import clean_script_text

VOICE_WAV = "./voice/furkanforenglish.wav"
MODEL = "tts_models/multilingual/multi-dataset/xtts_v2"

# Optimized parameters for better voice cloning similarity
# Only using parameters supported by XTTS v2
OPTIMIZED_PARAMS = {
    "gpt_cond_len": 30,          # Longer conditioning for better voice capture
    "gpt_cond_chunk_len": 4,     # Chunk size for conditioning
    "max_ref_len": 10,           # Maximum reference length in seconds
    "temperature": 0.7,          # Lower temperature for more consistent voice
    "length_penalty": 1.0,       # Length penalty
    "repetition_penalty": 5.0,   # Prevent repetition
    "top_k": 50,                 # Top-k sampling
    "top_p": 0.85,               # Top-p sampling
    "speed": 1.0,                # Speech speed (1.0 = normal)
}


def generate(text, out_path, use_gpu=True):
    """
    Generate TTS audio from text using cloned voice with optimized parameters.
    @param text Text to convert to speech
    @param out_path Output WAV file path
    @param use_gpu Use GPU if available
    """
    # Clean script text (remove headers and markdown)
    print(f"[TTS] Cleaning script text (removing headers and markdown)...")
    cleaned_text = clean_script_text(text)
    print(f"[TTS] Text cleaned: {len(text)} -> {len(cleaned_text)} characters")
    
    print(f"[TTS] Initializing model: {MODEL}")
    print(f"[TTS] GPU available: {torch.cuda.is_available()}")
    print(f"[TTS] Loading with optimized parameters for maximum voice similarity...")
    
    # Initialize TTS (GPU will be set using .to() method)
    tts = TTS(MODEL)
    
    # Move to GPU if available and requested
    if use_gpu and torch.cuda.is_available():
        device = "cuda"
        tts.to(device)
        print(f"[TTS] Using device: {device}")
    else:
        device = "cpu"
        print(f"[TTS] Using device: {device}")
    
    print(f"[TTS] Generating audio with voice cloning optimization...")
    print(f"[TTS] Reference voice: {VOICE_WAV}")
    
    # Generate with optimized parameters (using cleaned text)
    tts.tts_to_file(
        text=cleaned_text,
        speaker_wav=VOICE_WAV,
        language="en",
        file_path=out_path,
        **OPTIMIZED_PARAMS
    )
    print(f"[TTS] Audio generated successfully with optimized voice cloning")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_single.py \"Your text here\" output.wav [--cpu]")
        print("\nOptions:")
        print("  --cpu    Force CPU usage (slower but works without GPU)")
        sys.exit(1)

    text = sys.argv[1]
    out_file = sys.argv[2]
    use_gpu = "--cpu" not in sys.argv

    # Validate voice file exists
    if not os.path.exists(VOICE_WAV):
        print(f"[ERROR] Voice file not found: {VOICE_WAV}")
        sys.exit(1)

    # Validate output directory exists
    out_dir = os.path.dirname(out_file) if os.path.dirname(out_file) else "."
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        print(f"[INFO] Created output directory: {out_dir}")

    generate(text, out_file, use_gpu)
    print(f"\n[OK] Successfully generated: {out_file}")

