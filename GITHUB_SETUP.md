# GitHub Push Setup Guide

Projeyi GitHub'a push etmek için aşağıdaki adımları takip edin:

## 🔐 Authentication Yöntemleri

### Yöntem 1: Personal Access Token (Önerilen)

1. **GitHub Personal Access Token oluşturun:**
   - GitHub'a giriş yapın
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token (classic)" tıklayın
   - Token'a bir isim verin (örn: "content-pipeline")
   - `repo` scope'unu seçin
   - Token'ı kopyalayın (bir daha gösterilmeyecek!)

2. **Remote URL'i token ile güncelleyin:**
   ```bash
   git remote set-url origin https://<TOKEN>@github.com/CotNeo/educationalContentProductionPipeline.git
   ```

3. **Push yapın:**
   ```bash
   git push -u origin main
   ```

### Yöntem 2: SSH Key (Kalıcı Çözüm)

1. **SSH key oluşturun (eğer yoksa):**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **SSH key'i GitHub'a ekleyin:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   - Çıktıyı kopyalayın
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - Key'i yapıştırın ve kaydedin

3. **Remote URL'i SSH ile güncelleyin:**
   ```bash
   git remote set-url origin git@github.com:CotNeo/educationalContentProductionPipeline.git
   ```

4. **Push yapın:**
   ```bash
   git push -u origin main
   ```

### Yöntem 3: GitHub CLI (gh)

1. **GitHub CLI kurun:**
   ```bash
   # Ubuntu/Debian
   sudo apt install gh
   
   # macOS
   brew install gh
   ```

2. **Login olun:**
   ```bash
   gh auth login
   ```

3. **Push yapın:**
   ```bash
   git push -u origin main
   ```

## 📝 Mevcut Durum

✅ Git repository initialize edildi  
✅ Branch `main` olarak ayarlandı  
✅ Remote repository eklendi: `https://github.com/CotNeo/educationalContentProductionPipeline.git`  
✅ İlk commit yapıldı (51 dosya, 7457 satır)  
⏳ Push için authentication gerekiyor  

## 🚀 Hızlı Push Komutu

Yukarıdaki yöntemlerden birini kullandıktan sonra:

```bash
cd /home/cotneo/Desktop/Projects
git push -u origin main
```

## 🔍 Kontrol

Push başarılı olduktan sonra kontrol edin:

```bash
git remote -v
git log --oneline -5
```

GitHub repository'yi kontrol edin:
https://github.com/CotNeo/educationalContentProductionPipeline

## ⚠️ Notlar

- **Token güvenliği**: Personal Access Token'ı asla public repository'lere commit etmeyin
- **SSH key**: En güvenli ve kalıcı çözümdür
- **Merge conflicts**: Eğer remote'da dosyalar varsa, önce pull yapıp merge etmeniz gerekebilir

