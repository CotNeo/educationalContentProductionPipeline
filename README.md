# 🧠 İki Dilli YouTube + Medium Otomasyonu

Tam otomatik içerik üretim sistemi. Tek komutla Türkçe + İngilizce Medium yazısı, YouTube Shorts senaryosu, klonlanmış sesle seslendirme ve dikey video üretir.

## 🎯 Özellikler

- ✅ **İki Dilli İçerik**: Türkçe ve İngilizce otomatik içerik üretimi
- ✅ **Ses Klonlama**: XTTS v2 ile kendi sesinle seslendirme
- ✅ **Video Üretimi**: YouTube Shorts formatında dikey video
- ✅ **Tam Lokal**: Tüm işlemler MacBook'unuzda, ücretsiz
- ✅ **Tek Komut**: `node src/index.js "Konu başlığı"`

## 📋 Gereksinimler

### macOS Kurulumu

```bash
# Homebrew (yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js
brew install node

# Python 3.11 (TTS için gerekli)
brew install python@3.11

# ffmpeg
brew install ffmpeg

# Ollama
brew install --cask ollama
ollama pull mistral
ollama serve
```

### Ses Örneği Hazırlama

1. QuickTime ile 1-3 dakika boyunca kendi sesini kaydet
2. Türkçe + biraz İngilizce konuş
3. Dosyayı `furkan.wav` adıyla kaydet
4. **ÖNEMLİ**: Ses dosyası WAV formatında olmalı (M4A değil!)
5. Eğer M4A ise, FFmpeg ile dönüştür:
   ```bash
   ffmpeg -i furkan.m4a -acodec pcm_s16le -ar 22050 furkan.wav
   ```
6. `runtime/voice_samples/furkan.wav` içine koy

## 🚀 Kurulum

```bash
# Projeyi klonla veya dizine git
cd content-automation

# Node.js bağımlılıklarını yükle
npm install

# Python virtual environment oluştur ve TTS'i yükle
python3.11 -m venv venv
source venv/bin/activate

# TTS ve bağımlılıklarını yükle (uyumluluk için belirli versiyonlar)
pip install TTS
pip install transformers<4.40
pip install torch<2.6 torchaudio<2.6

# .env dosyası oluştur (opsiyonel, varsayılanlar kullanılabilir)
cp .env.example .env
```

## 💻 Kullanım

### Tek Konu İçin

```bash
node src/index.js "API nedir?"
```

Bu komut şunları üretir:
- 📄 `runtime/output/articles/api-nedir-tr.md` (TR Medium yazısı, 800-1000 kelime)
- 📄 `runtime/output/articles/api-nedir-en.md` (EN Medium yazısı, 800-1000 kelime)
- 📋 `runtime/output/storyboards/api-nedir-tr.md` (TR video storyboard)
- 📋 `runtime/output/storyboards/api-nedir-en.md` (EN video storyboard)
- 🔊 `runtime/output/audio/api-nedir-tr.wav` (TR ses, 60 saniye)
- 🔊 `runtime/output/audio/api-nedir-en.wav` (EN ses, 60 saniye)
- 🎬 `runtime/output/videos/api-nedir-tr.mp4` (TR Shorts, 1080x1920)
- 🎬 `runtime/output/videos/api-nedir-en.mp4` (EN Shorts, 1080x1920)

### Batch İşlem

`topics.json` dosyası oluştur:

```json
[
  "API nedir?",
  "React Hooks nasıl kullanılır?",
  "JavaScript async/await"
]
```

Sonra çalıştır:

```bash
node src/index.js --batch
```

## 📁 Proje Yapısı

```
otomation/
├── src/
│   ├── index.js              # Ana entry point
│   ├── config/               # Konfigürasyon
│   │   ├── appConfig.js      # Genel ayarlar
│   │   └── paths.js          # Dosya yolları
│   ├── core/                 # Logger, utils
│   │   ├── logger.js        # Loglama sistemi
│   │   └── utils.js         # Yardımcı fonksiyonlar
│   ├── services/             # LLM, TTS, Video servisleri
│   │   ├── llm/             # LLM servisleri
│   │   │   ├── llmClient.js # Ollama client
│   │   │   ├── prompts.js   # Prompt şablonları
│   │   │   └── contentService.js # İçerik üretimi
│   │   ├── tts/             # TTS servisleri
│   │   │   ├── ttsClient.js # Python bridge
│   │   │   ├── ttsService.js # TTS servisi
│   │   │   └── voiceProfiles.js # Ses profilleri
│   │   └── video/           # Video servisleri
│   │       ├── videoService.js # FFmpeg video oluşturma
│   │       └── styles.js     # Video stilleri
│   └── pipeline/             # Pipeline modülleri
│       ├── runForTopic.js   # Tek konu işleme
│       └── runBatch.js      # Toplu işleme
├── runtime/
│   ├── voice_samples/        # Ses örnekleri
│   │   └── furkan.wav       # Varsayılan ses örneği
│   └── output/               # Çıktılar
│       ├── articles/        # Medium makaleleri
│       ├── storyboards/     # Video storyboard'ları
│       ├── audio/           # Ses dosyaları
│       ├── videos/          # Video dosyaları
│       └── logs/            # Log dosyaları
├── tts_generate.py           # Python TTS script
├── topics.json.example       # Toplu işlem örneği
├── package.json             # Node.js bağımlılıkları
└── README.md               # Bu dosya
```

## ⚙️ Konfigürasyon

`src/config/appConfig.js` dosyasından ayarları değiştirebilirsiniz:

- **LLM Modeli**: `mistral` (varsayılan), `llama3.1:8b`, `llama3.2:latest` gibi modeller kullanılabilir
- **Timeout**: 10 dakika (600000ms) - uzun içerikler için yeterli
- **Makale Uzunluğu**: 800-1000 kelime
- **Video Boyutları**: 1080x1920 (YouTube Shorts formatı)
- **Video Stilleri**: minimal, gradient, modern
- **TTS Ayarları**: Ses örneği yolu ve voice ID

## 🔧 Sorun Giderme

### Ollama bağlantı hatası
```bash
# Ollama servisinin çalıştığından emin olun
ollama serve

# Modelin yüklü olduğunu kontrol edin
ollama list

# Model yoksa yükleyin
ollama pull mistral
```

### LLM timeout hatası
Eğer "LLM yanıt verme süresi aşıldı" hatası alıyorsanız:
- Model yüklenmesi ilk çalıştırmada uzun sürebilir
- `src/config/appConfig.js` dosyasında `timeout` değerini artırabilirsiniz
- Daha küçük bir model deneyebilirsiniz: `llama3.2:latest`

### TTS hatası
```bash
# Virtual environment'ı aktif edin
source venv/bin/activate

# TTS kütüphanesinin yüklü olduğunu kontrol edin
pip list | grep TTS

# Ses örneğinin doğru konumda ve formatında olduğunu kontrol edin
ls -lh runtime/voice_samples/furkan.wav
file runtime/voice_samples/furkan.wav  # WAV formatında olmalı

# Eğer M4A ise dönüştürün
ffmpeg -i runtime/voice_samples/furkan.wav -acodec pcm_s16le -ar 22050 runtime/voice_samples/furkan_converted.wav
mv runtime/voice_samples/furkan_converted.wav runtime/voice_samples/furkan.wav
```

### Python/TTS uyumluluk hatası
```bash
# Virtual environment'ı aktif edin
source venv/bin/activate

# Uyumlu versiyonları yükleyin
pip install transformers<4.40
pip install torch<2.6 torchaudio<2.6
```

### FFmpeg hatası
```bash
# FFmpeg'in yüklü olduğunu kontrol edin
ffmpeg -version

# Yoksa yükleyin
brew install ffmpeg
```

## 📝 Loglar

Tüm loglar `runtime/output/logs/` dizininde saklanır. Her gün için ayrı log dosyası oluşturulur.

## 🎨 Video Stilleri

Şu an desteklenen stiller:
- `minimal`: Temiz, minimal tasarım
- `gradient`: Renkli gradient arka plan
- `modern`: Modern, dinamik tasarım

Stil değiştirmek için `src/config/appConfig.js` dosyasında `video.style` değerini değiştirin.

## 🚧 Gelecek Özellikler (V2)

- [ ] Medium API ile otomatik yayın
- [ ] YouTube API ile otomatik Shorts yükleme
- [ ] Daha fazla video stili
- [ ] Thumbnail otomatik oluşturma
- [ ] Çoklu ses profili desteği
- [ ] Paralel LLM çağrıları (daha hızlı)
- [ ] Streaming LLM yanıtları (daha hızlı feedback)

## 📊 Sistem Gereksinimleri

- **macOS**: 10.15 veya üzeri
- **RAM**: En az 8GB (16GB önerilir)
- **Disk**: En az 10GB boş alan (modeller için)
- **Python**: 3.11 (3.9-3.12 arası desteklenir)
- **Node.js**: 18 veya üzeri

## 📄 Lisans

MIT

## 👤 Yazar

Furkan

---

## ⚠️ Önemli Notlar

1. **İlk Çalıştırma**: TTS modeli ilk çalıştırmada indirileceği için biraz zaman alabilir (~500MB). Sonraki çalıştırmalarda daha hızlı olacaktır.

2. **LLM Modeli**: Varsayılan model `mistral`'dır. İlk çalıştırmada model yüklenmesi nedeniyle yanıt süresi uzun olabilir (5-10 dakika). Sonraki çağrılar daha hızlı olacaktır.

3. **Ses Formatı**: Ses örneği mutlaka WAV formatında olmalı. M4A veya diğer formatlar çalışmaz.

4. **Virtual Environment**: TTS için Python virtual environment kullanılmalı. Sistem Python'u kullanmayın.

5. **Timeout**: Uzun içerikler için timeout 10 dakika olarak ayarlanmıştır. Gerekirse `src/config/appConfig.js` dosyasından artırılabilir.

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır! Büyük değişiklikler için önce bir issue açarak neyi değiştirmek istediğinizi tartışın.

## 📄 Lisans

MIT License - Detaylar için LICENSE dosyasına bakın.

