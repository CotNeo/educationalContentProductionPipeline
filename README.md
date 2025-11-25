# Educational Content Production Pipeline

**Professional Multi-Format Content Generation System**

Tamamen lokal çalışan, AI destekli eğitici içerik üretim pipeline'ı. Markdown makalelerinden otomatik olarak **PDF**, **TTS (Audio)**, **Video** ve **Script** dosyaları üretir.

## 🎯 Genel Bakış

Bu proje, eğitici içerik üretimini otomatikleştiren entegre bir sistemdir. Tek bir markdown makalesinden başlayarak, profesyonel kalitede çoklu format çıktılar üretebilirsiniz.

### Desteklenen Çıktı Formatları

- 📝 **Markdown Articles** - Medium'a direkt yapıştırılabilir format
- 📄 **PDF Documents** - Stylized PDF dökümanlar
- 🎙️ **Audio Narration** - Voice-cloned British English TTS
- 🎬 **Professional Videos** - Cinematic educational videos
- 📋 **Unified Scripts** - TTS + Video için ortak script formatı

## 🏗️ Proje Yapısı

```
Projects/
├── article-generation/          # Makale üretim servisi
├── video-scripter-service/      # Unified script üretim servisi
├── tts-service/                 # Text-to-Speech (ses üretimi)
├── video-generation-service/    # Video üretim servisi
└── pdf-service/                 # PDF dönüştürme servisi
```

## 🔄 Pipeline Workflow

```
┌─────────────────────┐
│  Markdown Article   │
│  (article.md)       │
└──────────┬──────────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
           ▼                                     ▼
┌──────────────────────┐              ┌─────────────────────┐
│  PDF Service         │              │  Video Scripter     │
│  → article.pdf       │              │  → unified_script   │
└──────────────────────┘              └──────────┬──────────┘
                                                 │
                          ┌──────────────────────┴──────────────────────┐
                          │                                             │
                          ▼                                             ▼
              ┌──────────────────────┐              ┌──────────────────────┐
              │  TTS Service         │              │  Video Generation    │
              │  → narration.wav     │              │  → professional.mp4  │
              └──────────────────────┘              └──────────────────────┘
```

## 📦 Servisler

### 1. Article Generation Service

**Markdown makale üretim servisi** - Local Ollama üzerinden DeepSeek R1 kullanarak otomatik makale üretir.

**Özellikler:**
- 🆓 Tamamen lokal (cloud API yok)
- 🎯 Çoklu şablon (Educational, Tutorial, Deep-dive)
- 🌍 Çoklu dil desteği (Türkçe/İngilizce)
- 📝 Medium formatında markdown çıktı

**Hızlı Başlangıç:**
```bash
cd article-generation
npm install
npm run generate:single -t "JavaScript Loops" -s educational -m 8
```

**Dokümantasyon:** `article-generation/README.md`

---

### 2. Video Scripter Service

**Unified TTS + Video Script Üretim Servisi** - Markdown makalelerini hem TTS hem de video üretimi için kullanılabilecek unified script formatına dönüştürür.

**Özellikler:**
- 📋 Tek script dosyası (TTS + Video için ortak)
- ⏱️ Saniye saniye timing planlaması
- 🎬 Detaylı görsel açıklamaları
- 🎙️ TTS ayarları (speed, tone, pauses)

**Hızlı Başlangıç:**
```bash
cd video-scripter-service
npm install
npm run generate:single what-is-it-javascript.md
```

**Çıktı:** `output/what-is-it-javascript_script.txt`

**Dokümantasyon:** `video-scripter-service/README.md`

---

### 3. TTS Service

**Text-to-Speech Servisi** - XTTS v2 kullanarak voice-cloned British English ses üretimi.

**Özellikler:**
- 🎤 Voice cloning (XTTS v2)
- 🇬🇧 British English narration
- 🔊 Scene-by-scene audio generation
- 📝 Unified script format desteği
- 🧹 Otomatik script temizleme

**Hızlı Başlangıç:**
```bash
cd tts-service
python3 -m venv venv
source venv/bin/activate
pip install coqui-tts

# Unified script'ten ses üret
python generate_unified.py \
  ../video-scripter-service/output/what-is-it-javascript_script.txt \
  out/narration.wav
```

**Çıktı:** `out/narration.wav`

**Dokümantasyon:** `tts-service/README.md`

---

### 4. Video Generation Service

**Profesyonel Video Üretim Servisi** - Unified script ve audio dosyasından cinematic educational video üretir.

**Özellikler:**
- 🎬 Studio-grade visuals
- 🎥 Cinematic color palette
- ✨ Smooth animations & transitions
- 💻 Code editor mockups
- 📊 Animated diagrams
- 🎨 Professional typography
- ⚡ Memory-optimized rendering

**Hızlı Başlangıç:**
```bash
cd video-generation-service
./setup.sh  # Virtual environment setup

# Video üret
./generate.sh \
  ../video-scripter-service/output/what-is-it-javascript_script.txt \
  ../tts-service/out/what-is-it-javascript_script.wav \
  output/video.mp4
```

**Çıktı:** `output/video.mp4`

**Dokümantasyon:** `video-generation-service/README.md`

---

### 5. PDF Service

**PDF Dönüştürme Servisi** - Markdown makalelerini styled PDF formatına dönüştürür.

**Özellikler:**
- 📄 Custom styling
- 🎨 Professional typography
- 📝 Multiple file support

**Hızlı Başlangıç:**
```bash
cd pdf-service
npm install
npm run convert:single what-is-it-javascript.md
```

**Çıktı:** `output/what-is-it-javascript.pdf`

**Dokümantasyon:** `pdf-service/README.md`

---

## 🎮 Interactive CLI (Recommended)

En kolay kullanım yöntemi: **Interactive CLI** ile tüm servisleri tek bir arayüzden yönetin!

### Kurulum

```bash
# Ana dizinde
npm install
```

### Kullanım

```bash
# Interactive CLI'yi başlat
npm start

# Veya direkt
node cli.js
```

### Özellikler

✅ **Menü tabanlı navigasyon** - Kolay kullanım  
✅ **Servis durumu kontrolü** - Tüm servislerin durumunu kontrol eder  
✅ **Dosya seçimi** - Mevcut makalelerden seçim yapma  
✅ **Full Pipeline** - Tek tıkla tüm pipeline'ı çalıştırma  
✅ **Hata yönetimi** - Anlaşılır hata mesajları  

### CLI Menü Seçenekleri

1. 📝 **Generate New Article** - Yeni makale üret
2. 📄 **Generate PDF** - Makaleden PDF oluştur
3. 📋 **Generate Video Script** - Makaleden video script oluştur
4. 🎙️ **Generate TTS Audio** - Script'ten ses dosyası oluştur
5. 🎬 **Generate Video** - Script + Audio'dan video oluştur
6. 🚀 **Full Pipeline** - Tüm pipeline'ı tek seferde çalıştır
7. 📊 **Check Service Status** - Servis durumlarını kontrol et
8. 📁 **List Available Articles** - Mevcut makaleleri listele
9. 📁 **List Generated Files** - Üretilen dosyaları listele
0. ❌ **Exit** - Çıkış

### Örnek Kullanım

```bash
$ npm start

══════════════════════════════════════════════════════════════════
  Educational Content Production Pipeline - Interactive CLI
══════════════════════════════════════════════════════════════════

📋 Main Menu
──────────────────────────────────────────────────────────────

  1. 📝 Generate New Article
  2. 📄 Generate PDF from Article
  3. 📋 Generate Video Script from Article
  4. 🎙️  Generate TTS Audio from Script
  5. 🎬 Generate Video from Script + Audio
  6. 🚀 Full Pipeline (Article → Script → Audio → Video)
  7. 📊 Check Service Status
  8. 📁 List Available Articles
  9. 📁 List Generated Files
  0. ❌ Exit

Select option (0-9): 6

🚀 Full Pipeline: Article → Script → Audio → Video
```

---

## 🚀 Hızlı Başlangıç - Complete Pipeline

Bir makaleden başlayarak tüm formatları üretmek için:

### Adım 1: Makale Üret (veya Mevcut Makaleyi Kullan)

```bash
cd article-generation
npm install
npm run generate:single -t "JavaScript Variables" -s educational -m 8
# Output: articles/what-is-it-javascript.md
```

### Adım 2: Unified Script Üret

```bash
cd ../video-scripter-service
npm install
npm run generate:single what-is-it-javascript.md
# Output: output/what-is-it-javascript_script.txt
```

### Adım 3: Audio (TTS) Üret

```bash
cd ../tts-service
python3 -m venv venv
source venv/bin/activate
pip install coqui-tts

python generate_unified.py \
  ../video-scripter-service/output/what-is-it-javascript_script.txt \
  out/what-is-it-javascript_script.wav
```

### Adım 4: Video Üret

```bash
cd ../video-generation-service
./setup.sh

./generate.sh \
  ../video-scripter-service/output/what-is-it-javascript_script.txt \
  ../tts-service/out/what-is-it-javascript_script.wav \
  output/what-is-it-javascript.mp4
```

### Adım 5: PDF Üret (Opsiyonel)

```bash
cd ../pdf-service
npm install
npm run convert:single what-is-it-javascript.md
# Output: output/what-is-it-javascript.pdf
```

**Sonuç:** Tek bir makaleden 5 farklı format çıktı! 🎉

---

## 📋 Gereksinimler

### Sistem Gereksinimleri

- **Node.js** (v18 veya üzeri)
- **Python 3.12** (TTS ve Video servisleri için)
- **FFmpeg** (Video servisi için)
- **Ollama** (Makale ve script üretimi için)

### Ollama Kurulumu

```bash
# Ollama'yı kurun
curl -fsSL https://ollama.com/install.sh | sh

# DeepSeek R1 modelini yükleyin
ollama pull deepseek-r1:14b

# Ollama servisini başlatın
ollama serve
```

### FFmpeg Kurulumu

```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg
```

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Tek Makale → Multi-Format Pipeline

Yukarıdaki "Hızlı Başlangıç" bölümündeki adımları takip edin. Tek bir makaleden tüm formatları üretirsiniz.

### Senaryo 2: Sadece Video Üretimi

Mevcut bir makale ve script'iniz varsa:

```bash
# 1. Script üret (eğer yoksa)
cd video-scripter-service
npm run generate:single article.md

# 2. Audio üret
cd ../tts-service
python generate_unified.py script.txt audio.wav

# 3. Video üret
cd ../video-generation-service
./generate.sh script.txt audio.wav output.mp4
```

### Senaryo 3: Sadece PDF Üretimi

```bash
cd pdf-service
npm run convert:single article.md
```

---

## 🔧 Teknik Detaylar

### Unified Script Formatı

Video ve TTS servisleri için ortak script formatı:

```yaml
---
[scene 1]

narration: |
  This is the exact text that TTS service will read aloud.
  Natural, spoken language style.

visual: |
  Detailed description of what video-generation service should create.
  Very specific: colors, animations, layout, camera angle.

duration: "8s"

tts_settings:
  speed: 1.05
  tone: "Educational and energetic"

video_settings:
  camera: "static front"
  mood: "modern, clean, minimal"
  animation: "code blocks fade in smoothly"
  background: "dark gradient"

code:
  read_aloud: false
  content: |
    console.log("Hello JS");
---
```

Detaylı format açıklaması: `video-scripter-service/README.md`

### Video Özellikleri

- **Resolution:** 1920x1080 (Full HD)
- **Frame Rate:** 30 FPS
- **Aspect Ratio:** 16:9 (configurable)
- **Codec:** H.264 (libx264)
- **Audio Codec:** AAC
- **Bitrate:** 5000k

### Audio Özellikleri

- **Format:** WAV
- **Quality:** High-quality voice cloning
- **Language:** British English
- **Voice:** Cloned from reference audio
- **Model:** XTTS v2

---

## 📁 Dosya Yapısı

```
Projects/
├── README.md                          # Bu dosya
│
├── article-generation/                # Makale üretim servisi
│   ├── articles/                      # Üretilen makaleler
│   ├── src/
│   │   ├── generateSingle.js         # CLI tool
│   │   ├── generateArticles.js       # Batch generation
│   │   └── ...
│   └── README.md
│
├── video-scripter-service/            # Script üretim servisi
│   ├── output/                        # Üretilen scriptler
│   ├── src/
│   │   ├── generateSingle.js         # CLI tool
│   │   └── ...
│   └── README.md
│
├── tts-service/                       # TTS servisi
│   ├── out/                           # Üretilen audio dosyaları
│   ├── voice/                         # Voice cloning referans dosyası
│   ├── generate_unified.py           # Unified script parser
│   └── README.md
│
├── video-generation-service/          # Video üretim servisi
│   ├── output/                        # Üretilen videolar
│   ├── src/
│   │   ├── generateSingle.py         # CLI tool
│   │   ├── professionalVideoGenerator.py
│   │   └── ...
│   ├── setup.sh                       # Setup script
│   ├── generate.sh                    # Convenience script
│   └── README.md
│
└── pdf-service/                       # PDF servisi
    ├── output/                        # Üretilen PDF'ler
    ├── src/
    │   └── ...
    └── README.md
```

---

## 🎨 Özellikler

### ✅ Tamamen Lokal

- Cloud API yok
- Tüm işlemler kendi makinenizde çalışır
- Veri gizliliği garanti

### ✅ Professional Quality

- Studio-grade video çıktıları
- Cinematic visual language
- High-quality voice cloning
- Professional typography

### ✅ Entegre Pipeline

- Tek makaleden multi-format çıktı
- Otomatik senkronizasyon
- Unified script formatı
- Smooth workflow

### ✅ Memory Optimized

- Efficient video rendering
- Disk-based frame storage
- Optimized memory usage
- Handles long videos

---

## 🔍 Troubleshooting

### Ollama Bağlantı Sorunları

```bash
# Ollama servisinin çalıştığını kontrol et
curl http://localhost:11434/api/tags

# Ollama'yı başlat
ollama serve
```

### Python Virtual Environment Sorunları

```bash
# Her serviste virtual environment kullanın
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### FFmpeg Sorunları

```bash
# FFmpeg'in yüklü olduğunu kontrol et
ffmpeg -version

# Yüklü değilse
sudo apt-get install ffmpeg
```

### Memory Sorunları (Video Generation)

Video üretimi sırasında OOM hatası alırsanız:

- Video çözünürlüğünü düşürün (`sceneRenderer.py`)
- Bitrate'i azaltın (`professionalVideoGenerator.py`)
- Daha küçük video segmentleri üretin

---

## 📚 Detaylı Dokümantasyon

Her servis için detaylı dokümantasyon:

- 📖 [Article Generation](./article-generation/README.md)
- 📖 [Video Scripter Service](./video-scripter-service/README.md)
- 📖 [TTS Service](./tts-service/README.md)
- 📖 [Video Generation Service](./video-generation-service/README.md)
- 📖 [PDF Service](./pdf-service/README.md)

---

## 🚦 Workflow Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                    ARTICLE GENERATION                       │
│  Topics.json → Ollama (DeepSeek R1) → Markdown Articles     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   PDF SERVICE (Parallel)                    │
│  Markdown → Styled PDF Document                             │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  VIDEO SCRIPTER SERVICE                     │
│  Markdown → Unified Script (TTS + Video format)             │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────────┐
│   TTS SERVICE   │    │ VIDEO GENERATION    │
│                 │    │    SERVICE          │
│ Script → Audio  │    │ Script + Audio →    │
│ (XTTS v2)       │    │ Professional Video  │
└─────────────────┘    └─────────────────────┘
```

---

## 📄 Lisans

MIT

---

## 🎉 Sonuç

Bu pipeline ile:

✅ **Tek makaleden** → 5 farklı format çıktı  
✅ **Profesyonel kalitede** → Studio-grade üretim  
✅ **Tamamen lokal** → Veri gizliliği garanti  
✅ **Otomatik senkronizasyon** → Perfect audio-video sync  
✅ **Scalable** → Kolayca genişletilebilir  

**Happy Content Creation! 🚀**

