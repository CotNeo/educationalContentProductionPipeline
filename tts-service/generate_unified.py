#!/usr/bin/env python3
"""
Generate TTS audio from unified script format.
Extracts narration from unified TTS + Video script and generates audio.
"""

from TTS.api import TTS
import sys
import os
import torch

# Import utilities
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unified_script_parser import extract_all_narration, get_tts_settings, parse_unified_script
from utils.script_cleaner import clean_script_text

VOICE_WAV = "./voice/furkanforenglish.wav"
MODEL = "tts_models/multilingual/multi-dataset/xtts_v2"

# Base optimized parameters
BASE_PARAMS = {
    "gpt_cond_len": 30,
    "gpt_cond_chunk_len": 4,
    "max_ref_len": 10,
    "temperature": 0.7,
    "length_penalty": 1.0,
    "repetition_penalty": 5.0,
    "top_k": 50,
    "top_p": 0.85,
}


def generate_from_unified_script(script_path: str, out_path: str, use_gpu: bool = True):
    """
    Generate TTS audio from unified script format.
    
    Args:
        script_path: Path to unified script file
        out_path: Output WAV file path
        use_gpu: Use GPU if available
    """
    print(f"[TTS] Parsing unified script: {script_path}")
    
    # Extract all narration text
    narration_text = extract_all_narration(script_path, join_scenes=True)
    
    if not narration_text:
        print("[ERROR] No narration text found in script!")
        sys.exit(1)
    
    print(f"[TTS] Extracted narration: {len(narration_text)} characters")
    
    # Get TTS settings from first scene (or use defaults)
    tts_settings = get_tts_settings(script_path)
    print(f"[TTS] TTS Settings: speed={tts_settings['speed']}, tone={tts_settings['tone']}")
    
    # Clean narration text (remove any remaining markdown)
    print(f"[TTS] Cleaning narration text...")
    cleaned_text = clean_script_text(narration_text)
    print(f"[TTS] Cleaned: {len(narration_text)} -> {len(cleaned_text)} characters")
    
    # Prepare TTS parameters with script settings
    tts_params = BASE_PARAMS.copy()
    tts_params["speed"] = tts_settings['speed']
    
    print(f"[TTS] Initializing model: {MODEL}")
    print(f"[TTS] GPU available: {torch.cuda.is_available()}")
    
    # Check GPU memory if using GPU
    if use_gpu and torch.cuda.is_available():
        try:
            # Get GPU memory info
            gpu_memory_total = torch.cuda.get_device_properties(0).total_memory / (1024**3)  # GB
            gpu_memory_allocated = torch.cuda.memory_allocated(0) / (1024**3)  # GB
            gpu_memory_free = gpu_memory_total - gpu_memory_allocated
            print(f"[TTS] GPU Memory: {gpu_memory_free:.2f} GB free / {gpu_memory_total:.2f} GB total")
            
            # If less than 1GB free, warn and suggest CPU mode
            if gpu_memory_free < 1.0:
                print(f"[WARNING] Low GPU memory ({gpu_memory_free:.2f} GB free). Consider using --cpu flag.")
        except Exception as e:
            print(f"[WARNING] Could not check GPU memory: {e}")
    
    # Initialize TTS
    tts = TTS(MODEL)
    
    # Move to GPU if available
    if use_gpu and torch.cuda.is_available():
        device = "cuda"
        try:
            # Clear cache before loading
            torch.cuda.empty_cache()
            tts.to(device)
            print(f"[TTS] Using device: {device}")
        except RuntimeError as e:
            if "out of memory" in str(e).lower():
                print(f"[ERROR] GPU out of memory! Switching to CPU mode...")
                print(f"[INFO] You can use --cpu flag to skip GPU entirely.")
                device = "cpu"
                # Clear GPU cache
                torch.cuda.empty_cache()
                tts.to(device)
                print(f"[TTS] Using device: {device} (fallback)")
            else:
                raise
    else:
        device = "cpu"
        print(f"[TTS] Using device: {device}")
    
    print(f"[TTS] Generating audio with voice cloning...")
    print(f"[TTS] Reference voice: {VOICE_WAV}")
    print(f"[TTS] Text length: {len(cleaned_text)} characters")
    
    # Generate audio
    try:
        tts.tts_to_file(
            text=cleaned_text,
            speaker_wav=VOICE_WAV,
            language="en",
            file_path=out_path,
            **tts_params
        )
        
        print(f"[TTS] ✅ Audio generated successfully: {out_path}")
    finally:
        # Clean up GPU memory
        if device == "cuda" and torch.cuda.is_available():
            torch.cuda.empty_cache()
            print(f"[TTS] GPU memory cleared")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_unified.py <unified_script_path> <output.wav> [--cpu]")
        print("\nExample:")
        print("  python generate_unified.py ../video-scripter-service/output/script.txt out/audio.wav")
        print("\nOptions:")
        print("  --cpu    Force CPU usage (slower but works without GPU)")
        sys.exit(1)
    
    script_path = sys.argv[1]
    out_file = sys.argv[2]
    use_gpu = "--cpu" not in sys.argv
    
    # Validate inputs
    if not os.path.exists(script_path):
        print(f"[ERROR] Script file not found: {script_path}")
        sys.exit(1)
    
    if not os.path.exists(VOICE_WAV):
        print(f"[ERROR] Voice file not found: {VOICE_WAV}")
        sys.exit(1)
    
    # Ensure output directory exists
    out_dir = os.path.dirname(out_file) if os.path.dirname(out_file) else "."
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir)
        print(f"[INFO] Created output directory: {out_dir}")
    
    print("=" * 60)
    print("TTS Service - Unified Script Audio Generation")
    print("=" * 60)
    print()
    
    try:
        generate_from_unified_script(script_path, out_file, use_gpu)
        print()
        print("=" * 60)
        print(f"✅ Success! Audio generated: {out_file}")
        print("=" * 60)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)






