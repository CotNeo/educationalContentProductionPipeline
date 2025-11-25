#!/usr/bin/env python3
"""
Generate a single video from unified script and audio file.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from professionalVideoGenerator import generate_professional_video


def main():
    if len(sys.argv) < 4:
        print("Usage: python generateSingle.py <script_path> <audio_path> <output_path>")
        print("\nExample:")
        print("  python generateSingle.py ../video-scripter-service/output/script.txt ../tts-service/out/audio.wav output/video.mp4")
        sys.exit(1)
    
    script_path = sys.argv[1]
    audio_path = sys.argv[2]
    output_path = sys.argv[3]
    
    # Validate inputs
    if not os.path.exists(script_path):
        print(f"❌ Error: Script file not found: {script_path}")
        sys.exit(1)
    
    if not os.path.exists(audio_path):
        print(f"❌ Error: Audio file not found: {audio_path}")
        sys.exit(1)
    
    # Ensure output directory exists
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    
    try:
        print("=" * 60)
        print("Professional Video Generation Service")
        print("=" * 60)
        print()
        
        generate_professional_video(script_path, audio_path, output_path)
        
        print()
        print("=" * 60)
        print(f"✅ Success! Video generated: {output_path}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
