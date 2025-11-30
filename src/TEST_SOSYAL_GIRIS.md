# 🧪 Sosyal Giriş Test Senaryoları

## Test Ortamı Hazırlığı

### Ön Koşullar
1. ✅ Supabase projesi aktif
2. ⚠️ Google OAuth kurulumu yapılmalı (opsiyonel - test için)
3. ⚠️ Facebook OAuth kurulumu yapılmalı (opsiyonel - test için)

---

## Test Senaryoları

### 1️⃣ Provider Kurulu DEĞİLSE (Varsayılan Durum)

**Test Adımları:**
1. `/giris` sayfasına git
2. "Google ile Giriş Yap" butonuna tıkla

**Beklenen Sonuç:**
- ❌ "Google Girişi Henüz Aktif Değil" toast mesajı görünmeli
- 📝 Console'da kurulum talimatları görünmeli:
  ```
  ⚠️ GOOGLE OAUTH KURULUMU GEREKLİ!
  1. Supabase Dashboard > Authentication > Providers > Google
  2. Detaylı kurulum için: /OAUTH_SETUP.md dosyasına bakın
  ```
- ✅ Kullanıcı e-posta ile giriş yapabilmeli

**Test Adımları (Facebook):**
1. `/giris` sayfasına git
2. "Facebook ile Giriş Yap" butonuna tıkla

**Beklenen Sonuç:**
- ❌ "Facebook Girişi Henüz Aktif Değil" toast mesajı görünmeli
- 📝 Console'da kurulum talimatları görünmeli
- ✅ Kullanıcı e-posta ile giriş yapabilmeli

---

### 2️⃣ Provider Kuruluysa (Google Aktif)

**Ön Koşul:** Google OAuth Supabase Dashboard'da aktif edilmiş olmalı

**Test Adımları:**
1. `/giris` sayfasına git
2. "Google ile Giriş Yap" butonuna tıkla
3. Google login popup'ı açılmalı
4. Google hesabı ile giriş yap

**Beklenen Sonuç:**
- ✅ Google login popup'ı açılır
- ✅ Giriş yaptıktan sonra `/auth/callback` sayfasına yönlendirilir
- ✅ "Giriş Yapılıyor..." loading ekranı gösterilir
- ✅ Backend'e OAuth callback isteği gönderilir
- ✅ Yeni kullanıcı ise `customers` tablosuna kaydedilir
- ✅ "🎉 Hoş Geldiniz!" toast mesajı görünür
- ✅ Ana sayfaya yönlendirilir
- ✅ Navbar'da kullanıcı adı görünür

**Console Logları:**
```
[AUTH] Google ile giriş başlatılıyor...
[AUTH] Google yönlendirmesi başlatıldı
[AUTH CALLBACK] OAuth callback işleniyor...
[AUTH CALLBACK] Session alındı: user@gmail.com
[AUTH CALLBACK] Backend yanıtı: { success: true, customer: {...} }
[AUTH CALLBACK] Ana sayfaya yönlendiriliyor...
```

---

### 3️⃣ Kayıt Ol Sekmesinden Google ile Giriş

**Test Adımları:**
1. `/kayit` sayfasına git
2. "Google ile Kayıt Ol" butonuna tıkla
3. Google hesabı ile giriş yap

**Beklenen Sonuç:**
- ✅ Google ile giriş yapılır
- ✅ Yeni kullanıcı otomatik oluşturulur
- ✅ Ana sayfaya yönlendirilir
- ✅ Profil sayfasında telefon numarası boş olabilir (manuel eklenebilir)

---

### 4️⃣ Mevcut Kullanıcı Google ile Giriş

**Ön Koşul:** Kullanıcı daha önce Google ile kayıt olmuş

**Test Adımları:**
1. `/giris` sayfasına git
2. "Google ile Giriş Yap" butonuna tıkla
3. Aynı Google hesabı ile giriş yap

**Beklenen Sonuç:**
- ✅ Mevcut customer kaydı bulunur
- ✅ Yeni kayıt oluşturulmaz
- ✅ Giriş başarılı olur
- ✅ Kullanıcı bilgileri güncellenebilir (isim vs.)

---

### 5️⃣ Facebook ile Giriş (Provider Aktifse)

**Test Adımları:**
1. `/giris` sayfasına git
2. "Facebook ile Giriş Yap" butonuna tıkla
3. Facebook login popup'ı açılmalı
4. Facebook hesabı ile giriş yap

**Beklenen Sonuç:**
- ✅ Facebook login popup'ı açılır
- ✅ Giriş sonrası callback sayfasına yönlendirilir
- ✅ Customer kaydı oluşturulur/güncellenir
- ✅ Ana sayfaya yönlendirilir

---

### 6️⃣ OAuth Callback Sayfası Hata Durumları

**Test Adımları:**
1. Google ile giriş başlat
2. Google popup'ı iptal et (cancel)

**Beklenen Sonuç:**
- ⚠️ Popup kapandığında hiçbir şey olmaz
- ✅ Kullanıcı giriş sayfasında kalır

**Test Adımları (Backend Hatası):**
1. Backend'i durdur
2. Google ile giriş yap
3. Callback sayfasına yönlendir

**Beklenen Sonuç:**
- ❌ "Hesap oluşturulamadı" toast mesajı
- 📝 Console'da hata detayları
- ✅ 2 saniye sonra `/giris` sayfasına yönlendirilir

---

### 7️⃣ Return URL Testi

**Test Adımları:**
1. Sepete git: `/sepet`
2. Ürün ekle
3. "Sipariş Ver" butonuna tıkla (giriş gerektiriyor)
4. Giriş sayfasına yönlendirilir
5. Google ile giriş yap

**Beklenen Sonuç:**
- ✅ Giriş sonrası sepet sayfasına geri dönmeli (returnUrl çalışıyor mu kontrol edilmeli)
- ⚠️ OAuth redirect sonrası returnUrl kaybolabilir - bu durumda ana sayfaya döner (normal davranış)

---

### 8️⃣ Admin Hesabı ile OAuth Testi

**Test Adımları:**
1. Admin email ile Google hesabı oluştur
2. Google ile giriş yap
3. Admin Dashboard'a gitmeye çalış

**Beklenen Sonuç:**
- ✅ OAuth ile giriş yapılır
- ❌ `is_admin: false` olarak customer kaydı oluşur
- ❌ Admin Dashboard'a erişemez
- ℹ️ OAuth ile oluşturulan hesaplar otomatik olarak müşteri hesabıdır
- ℹ️ Admin hesapları manuel olarak `/admin-setup` ile oluşturulmalıdır

---

## Hata Senaryoları

### ❌ "Provider is not enabled"
- **Sebep:** Supabase Dashboard'da provider aktif değil
- **Çözüm:** `/SOSYAL_GIRIS_KURULUM.md` dosyasına bakın

### ❌ "Invalid redirect URI"
- **Sebep:** OAuth provider'da redirect URI yanlış
- **Çözüm:** `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` olduğundan emin olun

### ❌ "Session bulunamadı"
- **Sebep:** OAuth callback sırasında session alınamadı
- **Çözüm:** Browser console'da detaylı hata mesajını kontrol edin

### ❌ "Backend hatası"
- **Sebep:** `/auth/oauth-callback` endpoint'inde hata
- **Çözüm:** Backend logs'ları kontrol edin

---

## Kontrol Listesi

Sistem tamamen çalışıyor mu?

- [ ] Google butonu aktif ve çalışıyor
- [ ] Facebook butonu aktif ve çalışıyor
- [ ] Provider kurulu değilse doğru hata mesajı gösteriliyor
- [ ] Yeni kullanıcı kaydı oluşturuluyor
- [ ] Mevcut kullanıcı güncellemesi çalışıyor
- [ ] OAuth callback sayfası çalışıyor
- [ ] Giriş sonrası ana sayfaya yönlendirme yapılıyor
- [ ] LocalStorage'da session kaydediliyor
- [ ] Navbar'da kullanıcı adı görünüyor
- [ ] Console'da detaylı loglar var
- [ ] Hata durumlarında kullanıcı dostu mesajlar gösteriliyor

---

## Sonuç

✅ Sistem başarıyla kuruldu ve test edilmeye hazır!

⚠️ Provider kurulumu yapılmadan butonlar "Henüz Aktif Değil" mesajı gösterecektir.

📚 Kurulum için: `/SOSYAL_GIRIS_KURULUM.md`
