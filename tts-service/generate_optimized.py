"""
Advanced optimized TTS generation with maximum voice similarity.
Uses all available XTTS v2 optimizations for best voice cloning results.
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


def generate_optimized(text, out_path, use_gpu=True):
    """
    Generate TTS audio with maximum voice similarity optimization.
    @param text Text to convert to speech
    @param out_path Output WAV file path
    @param use_gpu Use GPU if available (faster and sometimes better quality)
    """
    # Clean script text (remove headers and markdown)
    print(f"[TTS] Cleaning script text (removing headers and markdown)...")
    cleaned_text = clean_script_text(text)
    print(f"[TTS] Text cleaned: {len(text)} -> {len(cleaned_text)} characters")
    
    print(f"[TTS] Initializing model: {MODEL}")
    print(f"[TTS] GPU available: {torch.cuda.is_available()}")
    print(f"[TTS] Using GPU: {use_gpu and torch.cuda.is_available()}")
    
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
    
    print(f"[TTS] Generating with MAXIMUM voice similarity settings...")
    print(f"[TTS] Reference voice: {VOICE_WAV}")
    print(f"[TTS] Text length: {len(cleaned_text)} characters")
    
    # Maximum similarity parameters (only supported parameters)
    # These settings prioritize voice accuracy over speed
    tts.tts_to_file(
        text=cleaned_text,
        speaker_wav=VOICE_WAV,
        language="en",
        file_path=out_path,
        gpt_cond_len=30,              # Longer conditioning = better voice capture
        gpt_cond_chunk_len=4,         # Optimal chunk size
        max_ref_len=10,               # Use more of reference audio
        temperature=0.7,              # Lower = more consistent voice
        length_penalty=1.0,           # Natural length
        repetition_penalty=5.0,       # Prevent repetition
        top_k=50,                     # Sampling diversity
        top_p=0.85,                   # Nucleus sampling
        speed=1.0,                    # Normal speed
    )
    
    print(f"[TTS] ✓ Audio generated with optimized voice cloning")
    print(f"[TTS] ✓ Output saved to: {out_path}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_optimized.py \"Your text here\" output.wav [--cpu]")
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

    generate_optimized(text, out_file, use_gpu)
    print(f"\n[OK] Successfully generated: {out_file}")

