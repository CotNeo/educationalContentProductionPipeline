#!/usr/bin/env python3
"""
TTS Ses Sentezi Script'i
XTTS v2 modelini kullanarak ses klonlama yapar
"""

import sys
import os
from pathlib import Path

try:
    from TTS.api import TTS
except ImportError:
    print("ERROR: TTS kütüphanesi bulunamadı. Lütfen 'pip3 install TTS' komutunu çalıştırın.")
    sys.exit(1)

def main():
    # Komut satırı argümanlarını al
    if len(sys.argv) != 4:
        print("Kullanım: python3 tts_generate.py <text> <output_path> <lang>")
        print("Örnek: python3 tts_generate.py 'Merhaba dünya' output.wav tr")
        sys.exit(1)
    
    text = sys.argv[1]
    output_path = sys.argv[2]
    lang = sys.argv[3].lower()
    
    # Dil kodunu doğrula
    if lang not in ["tr", "en"]:
        print(f"ERROR: Desteklenmeyen dil: {lang}. Sadece 'tr' veya 'en' kullanılabilir.")
        sys.exit(1)
    
    # Çıktı dizinini oluştur
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        print(f"[TTS] Çıktı dizini oluşturuldu: {output_dir}")
    
    # Ses örneği yolunu belirle
    script_dir = Path(__file__).parent
    voice_sample_path = script_dir / "runtime" / "voice_samples" / "furkan.wav"
    
    if not voice_sample_path.exists():
        print(f"ERROR: Ses örneği dosyası bulunamadı: {voice_sample_path}")
        print("Lütfen ses örneğini bu konuma yerleştirin.")
        sys.exit(1)
    
    print(f"[TTS] Başlatılıyor...")
    print(f"[TTS] Metin: {text[:50]}...")
    print(f"[TTS] Dil: {lang}")
    print(f"[TTS] Çıktı: {output_path}")
    print(f"[TTS] Ses örneği: {voice_sample_path}")
    
    try:
        # XTTS v2 modelini yükle
        print("[TTS] Model yükleniyor (ilk çalıştırmada biraz zaman alabilir)...")
        tts = TTS(
            model_name="tts_models/multilingual/multi-dataset/xtts_v2",
            progress_bar=True
        )
        
        # Ses sentezi yap
        print("[TTS] Ses sentezi yapılıyor...")
        tts.tts_to_file(
            text=text,
            file_path=output_path,
            speaker_wav=str(voice_sample_path),
            language=lang
        )
        
        # Dosyanın oluşturulduğunu kontrol et
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"[TTS] Başarılı! Dosya oluşturuldu: {output_path} ({file_size} bytes)")
            sys.exit(0)
        else:
            print(f"ERROR: Ses dosyası oluşturulamadı: {output_path}")
            sys.exit(1)
            
    except Exception as e:
        print(f"ERROR: TTS işlemi başarısız: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

