# 🔐 Sosyal Giriş Sistemi - Google & Facebook

Ersin Spot web sistemi için Google ve Facebook ile giriş yapma özelliği başarıyla entegre edilmiştir.

## ✅ Tamamlanan İşlemler

1. **Frontend Entegrasyonu**
   - ✅ LoginPage'de Google ve Facebook butonları aktif
   - ✅ Hem "Giriş Yap" hem de "Kayıt Ol" sekmelerinde çalışıyor
   - ✅ OAuth callback sayfası oluşturuldu (`/auth/callback`)
   - ✅ AuthContext'e sosyal giriş fonksiyonları eklendi
   - ✅ Kullanıcı dostu hata mesajları

2. **Backend Entegrasyonu**
   - ✅ OAuth callback endpoint'i: `/auth/oauth-callback`
   - ✅ Otomatik customer kaydı (yeni kullanıcılar için)
   - ✅ Mevcut kullanıcı güncellemesi
   - ✅ Supabase Auth ile tam entegrasyon

3. **Güvenlik**
   - ✅ Tüm OAuth işlemleri Supabase Auth üzerinden
   - ✅ Backend'de token doğrulama
   - ✅ Customer tablosunda otomatik kayıt

## ⚙️ Kurulum Gereksinimleri

### Google OAuth Kurulumu

**Önemli:** Google ile giriş çalışması için Supabase Dashboard'da kurulum yapılmalıdır.

1. **Google Cloud Console'da OAuth Client oluşturun:**
   - Adres: https://console.cloud.google.com/
   - APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID
   - Authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Client ID ve Client Secret'i kopyalayın

2. **Supabase Dashboard'da aktif edin:**
   - Authentication > Providers > Google
   - Enable butonu ile aktif edin
   - Client ID ve Secret'i yapıştırın
   - Save

**Detaylı Kılavuz:** https://supabase.com/docs/guides/auth/social-login/auth-google

---

### Facebook OAuth Kurulumu

**Önemli:** Facebook ile giriş çalışması için Supabase Dashboard'da kurulum yapılmalıdır.

1. **Facebook Developers'da App oluşturun:**
   - Adres: https://developers.facebook.com/
   - My Apps > Create App
   - Facebook Login ürününü ekleyin
   - Settings > Basic'den App ID ve App Secret'i kopyalayın
   - Valid OAuth Redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

2. **Supabase Dashboard'da aktif edin:**
   - Authentication > Providers > Facebook
   - Enable butonu ile aktif edin
   - App ID ve Secret'i yapıştırın
   - Save

**Detaylı Kılavuz:** https://supabase.com/docs/guides/auth/social-login/auth-facebook

---

## 🚀 Kullanım

Kurulum tamamlandıktan sonra:

1. Kullanıcı `/giris` veya `/kayit` sayfasına gider
2. "Google ile Giriş Yap" veya "Facebook ile Giriş Yap" butonuna tıklar
3. İlgili provider'ın login popup'ı açılır
4. Giriş yapıldıktan sonra otomatik olarak ana sayfaya yönlendirilir
5. Yeni kullanıcılar otomatik olarak `customers` tablosuna kaydedilir

## ⚠️ Önemli Notlar

- **Provider kurulumu yapılmazsa** kullanıcı "Bu özellik şu anda kullanılamıyor" hatası alır
- Hata durumunda browser console'da detaylı kurulum talimatları gösterilir
- Test aşamasında Facebook'ta kendinizi "Test User" olarak eklemelisiniz
- OAuth ile giriş yapan kullanıcıların telefon numarası boş olabilir (daha sonra profilde güncellenebilir)

## 🔍 Test Etme

1. Supabase Dashboard'da provider'ları aktif edin
2. `/giris` sayfasına gidin
3. Google veya Facebook butonuna tıklayın
4. Giriş yapın ve otomatik yönlendirmeyi bekleyin

## 📝 Sorun Giderme

### "Provider is not enabled" hatası
- Supabase Dashboard'da provider'ın Enable edildiğinden emin olun
- Client ID/Secret'in doğru girildiğini kontrol edin

### Callback çalışmıyor
- Redirect URI'nin hem OAuth provider'da hem de Supabase'de aynı olduğundan emin olun
- Browser console'da hata mesajlarını inceleyin

### Kullanıcı kaydı oluşmuyor
- Backend logs'ları kontrol edin: `/auth/oauth-callback` endpoint'inde hata var mı?
- `customers` tablosunun mevcut olduğundan emin olun

## 📞 Destek

Detaylı kurulum kılavuzu için `/OAUTH_SETUP.md` dosyasına bakın.
