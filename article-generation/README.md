# Medium Article Bot

Local Ollama üzerinden DeepSeek R1 kullanarak Medium makaleleri üreten otomatik sistem.

## ✨ Özellikler

- 🆓 **Tamamen Ücretsiz** - Cloud API yok, local çalışır
- 🚀 **Hızlı** - Kendi makinenizde çalışır
- 📝 **Otomatik Makale Üretimi** - topics.json'daki konular için
- 🎯 **Çoklu Şablon** - Educational, Tutorial, Deep-dive
- 🌍 **Çoklu Dil** - Türkçe/İngilizce
- 📁 **Markdown Çıktı** - Medium'a direkt yapıştırılabilir

## 📋 Gereksinimler

1. **Node.js** (v18 veya üzeri)
2. **Ollama** kurulu ve çalışıyor olmalı
3. **DeepSeek R1 modeli** yüklü olmalı

## 🚀 Kurulum

### 1. Ollama Kurulumu

```bash
# Ollama'yı kurun (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Modeli yükleyin
ollama pull deepseek-r1:14b
```

### 2. Proje Kurulumu

```bash
# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun
cp .env.example .env
```

`.env` dosyası varsayılan olarak şu değerleri kullanır:
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:14b
```

### 3. Ollama Servisini Başlatın

```bash
# Ollama servisini başlatın (arka planda çalışıyor olmalı)
ollama serve
```

## 📖 Kullanım

### Yöntem 1: Tek Makale Üretimi (CLI)

Terminalden tek komutla istediğiniz konuda makale üretebilirsiniz:

```bash
# Basit kullanım
npm run generate:single -- --topic "JavaScript Loops" --skeleton educational --time 8

# Kısa parametreler
npm run generate:single -t "React Hooks" -s tutorial -m 10

# İnteraktif mod (sorular sorar)
npm run generate:single -- --interactive
```

**Parametreler:**
- `--topic, -t`: Makale konusu (zorunlu)
- `--skeleton, -s`: Şablon türü (`educational`, `tutorial`, `deep-dive`) - varsayılan: `educational`
- `--time, -m`: Okuma süresi (dakika) - varsayılan: `8`
- `--interactive, -i`: İnteraktif mod

**Örnekler:**
```bash
# JavaScript Loops - Educational - 8 dakika
npm run generate:single -t "JavaScript Loops" -s educational -m 8

# React State Management - Deep-dive - 12 dakika
npm run generate:single -t "React State Management" -s deep-dive -m 12

# Node.js Microservices - Tutorial - 10 dakika
npm run generate:single -t "Node.js Microservices" -s tutorial -m 10
```

**Not:** Tüm makaleler otomatik olarak İngilizce üretilir.

### Yöntem 2: Toplu Makale Üretimi

`src/config/topics.json` dosyasını düzenleyin:

```json
[
  {
    "slug": "js-event-loop",
    "title": "JavaScript Event Loop: 2025 İçin En Basit Anlatım",
    "language": "tr",
    "skeleton": "educational",
    "audience": "junior-mid frontend developer",
    "readingTime": "7"
  }
]
```

Sonra:
```bash
npm run generate
```

### Makaleleri Bulun

Üretilen makaleler `articles/` klasöründe `.md` formatında kaydedilir.

## 📁 Proje Yapısı

```
medium-article-bot/
  ├─ package.json              # Proje yapılandırması
  ├─ .env                      # Ortam değişkenleri (Ollama ayarları)
  ├─ .env.example              # Örnek .env dosyası
  ├─ README.md                 # Bu dosya
  ├─ OLLAMA_SETUP.md           # Ollama kurulum rehberi
  ├─ src/
  │   ├─ config/
  │   │   └─ topics.json       # Toplu makale konuları
  │   ├─ templates/
  │   │   ├─ educational.txt   # Eğitici makale şablonu
  │   │   ├─ tutorial.txt      # Adım adım tutorial şablonu
  │   │   └─ deep-dive.txt     # Derin teknik inceleme şablonu
  │   ├─ prompts/
  │   │   └─ buildPrompt.js    # Prompt builder modülü
  │   ├─ llm/
  │   │   └─ callOllama.js     # Ollama API entegrasyonu
  │   ├─ utils/
  │   │   └─ fileUtils.js       # Dosya işlemleri yardımcı fonksiyonları
  │   ├─ generateArticles.js   # Toplu makale üretim scripti
  │   └─ generateSingle.js     # Tek makale üretim CLI aracı
  └─ articles/                 # Üretilen makaleler (otomatik oluşturulur)
```

## ⚙️ Yapılandırma

### Konu Yapılandırması

`topics.json` dosyasındaki her konu şu alanları içerir:

- **slug**: Dosya adı için kısa tanımlayıcı (opsiyonel)
- **title**: Makale başlığı
- **language**: `"tr"` veya `"en"`
- **skeleton**: `"educational"`, `"tutorial"`, veya `"deep-dive"`
- **audience**: Hedef kitle açıklaması
- **readingTime**: Tahmini okuma süresi (dakika)

### Şablonlar

Şablonlar `src/templates/` klasöründe bulunur:
- `educational.txt` - Eğitici teknik makale
- `tutorial.txt` - Adım adım tutorial
- `deep-dive.txt` - Derin teknik inceleme

Şablonları ihtiyacınıza göre özelleştirebilirsiniz.

## 🔧 Sorun Giderme

### Ollama Bağlantı Hatası

```
❌ Ollama servisine bağlanılamadı!
```

**Çözüm:**
1. Ollama kurulu mu kontrol edin: `ollama --version`
2. Ollama servisi çalışıyor mu: `ollama serve`
3. Model yüklü mü: `ollama list`
4. `.env` dosyasında `OLLAMA_URL` doğru mu?

### Model Bulunamadı Hatası

```
Ollama modeli bulunamadı: deepseek-r1:14b
```

**Çözüm:**
```bash
# Modeli yükleyin
ollama pull deepseek-r1:14b

# Veya farklı bir model kullanın
# .env dosyasında OLLAMA_MODEL değerini değiştirin
```

### Yavaş Üretim

DeepSeek R1 modeli büyük bir modeldir ve üretim biraz zaman alabilir. Sabırlı olun!

## 📝 Notlar

- İlk çalıştırmada model yüklenmesi zaman alabilir
- Her makale üretimi 1-5 dakika sürebilir (model ve donanıma bağlı)
- Makaleler Medium'a direkt yapıştırılabilir format
- Şablonları özelleştirerek istediğiniz stili oluşturabilirsiniz

## 🎯 Kullanım Senaryoları

### Senaryo 1: Tek Makale (CLI)

```bash
# Hızlı bir makale üretmek için
npm run generate:single -t "JavaScript Loops" -s educational -m 8
```

### Senaryo 2: Toplu Makale Üretimi

1. `src/config/topics.json` dosyasına makale konularını ekleyin
2. `npm run generate` çalıştırın
3. `articles/` klasöründeki `.md` dosyalarını Medium'a yapıştırın
4. İsterseniz küçük düzenlemeler yapın ve yayınlayın!

### Senaryo 3: İnteraktif Mod

```bash
# Sorular sorarak makale üretmek için
npm run generate:single -- --interactive
```

## 📚 Ek Dokümantasyon

- **OLLAMA_SETUP.md**: Detaylı Ollama kurulum ve yapılandırma rehberi
- **README.md**: Bu dosya - genel kullanım kılavuzu

## 📄 Lisans

MIT
