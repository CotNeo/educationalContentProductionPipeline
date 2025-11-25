# Ollama Kurulum Rehberi

Bu proje, local Ollama servisi üzerinden DeepSeek R1 modelini kullanarak makale üretir. Cloud API'ye ihtiyaç yok, tamamen ücretsiz!

## Ollama Nedir?

Ollama, local makinenizde büyük dil modellerini çalıştırmanızı sağlayan bir araçtır. DeepSeek R1 gibi modelleri kendi bilgisayarınızda çalıştırabilirsiniz.

## Kurulum Adımları

### 1. Ollama'yı Kurun

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**macOS:**
```bash
brew install ollama
```

**Windows:**
[Ollama.com](https://ollama.com) adresinden indirin ve kurun.

### 2. Ollama Servisini Başlatın

Ollama genellikle kurulumdan sonra otomatik başlar. Kontrol etmek için:

```bash
ollama --version
```

Eğer çalışmıyorsa:
```bash
ollama serve
```

### 3. DeepSeek R1 Modelini Yükleyin

```bash
# 14B parametreli model (önerilen, dengeli)
ollama pull deepseek-r1:14b

# Alternatif modeller:
# ollama pull deepseek-r1:32b  # Daha güçlü ama daha yavaş
# ollama pull deepseek-r1:1.5b # Daha hızlı ama daha az güçlü
```

### 4. Modeli Test Edin

```bash
ollama run deepseek-r1:14b "Merhaba, nasılsın?"
```

Eğer cevap alırsanız, model başarıyla yüklenmiştir!

## Yüklü Modelleri Listeleme

```bash
ollama list
```

## Model Bilgilerini Görüntüleme

```bash
ollama show deepseek-r1:14b
```

## Sistem Gereksinimleri

### DeepSeek R1:14B için:
- **RAM**: En az 16GB (32GB önerilir)
- **Disk**: ~8GB boş alan
- **CPU**: Modern işlemci (GPU opsiyonel ama hızlandırır)

### DeepSeek R1:32B için:
- **RAM**: En az 32GB (64GB önerilir)
- **Disk**: ~20GB boş alan
- **GPU**: Önerilir (NVIDIA GPU varsa çok daha hızlı)

## GPU Desteği (Opsiyonel)

NVIDIA GPU'nuz varsa, Ollama otomatik olarak kullanır. Kontrol etmek için:

```bash
ollama run deepseek-r1:14b
# GPU kullanılıyorsa daha hızlı çalışır
```

## Sorun Giderme

### Ollama Başlamıyor

```bash
# Servisi yeniden başlatın
ollama serve

# Veya servis durumunu kontrol edin
systemctl status ollama  # Linux
```

### Model Yüklenmiyor

```bash
# İnternet bağlantınızı kontrol edin
# Disk alanınızı kontrol edin
ollama pull deepseek-r1:14b
```

### Yavaş Çalışıyor

- GPU kullanıp kullanmadığınızı kontrol edin
- Daha küçük bir model deneyin (1.5b)
- RAM'inizin yeterli olduğundan emin olun

### Port Çakışması

Varsayılan port 11434. Değiştirmek için:

```bash
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

Ve `.env` dosyasında:
```env
OLLAMA_URL=http://localhost:11435
```

## Performans İpuçları

1. **GPU Kullanın**: NVIDIA GPU varsa otomatik kullanılır
2. **RAM Yeterli Olsun**: Model RAM'de çalışır
3. **SSD Kullanın**: Model yükleme daha hızlı olur
4. **Küçük Model**: Hız için 1.5b, kalite için 14b veya 32b

## Model Karşılaştırması

| Model | Boyut | RAM | Hız | Kalite |
|-------|-------|-----|-----|--------|
| deepseek-r1:1.5b | ~1GB | 4GB | ⚡⚡⚡ | ⭐⭐ |
| deepseek-r1:14b | ~8GB | 16GB | ⚡⚡ | ⭐⭐⭐⭐ |
| deepseek-r1:32b | ~20GB | 32GB | ⚡ | ⭐⭐⭐⭐⭐ |

**Öneri**: Başlangıç için 14b modeli idealdir.

## Sonraki Adımlar

Ollama kurulduktan ve model yüklendikten sonra:

1. `.env` dosyasını kontrol edin
2. `npm run generate` komutunu çalıştırın
3. Makaleleriniz `articles/` klasöründe oluşacak!

## Daha Fazla Bilgi

- [Ollama Dokümantasyonu](https://github.com/ollama/ollama)
- [DeepSeek Modelleri](https://ollama.com/library/deepseek-r1)
- [Ollama Modelleri](https://ollama.com/library)

