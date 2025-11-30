# Google ve Facebook OAuth Kurulum Kılavuzu

Google ve Facebook ile sosyal giriş sistemi aktif hale getirilmiştir. Ancak çalışması için Supabase Dashboard'da provider kurulumu yapılması gerekmektedir.

## 🔧 Kurulum Adımları

### 1. Supabase Dashboard'a Giriş Yapın
- Projenizin Supabase Dashboard'ına gidin
- Authentication > Providers menüsüne tıklayın

### 2. Google OAuth Kurulumu

#### a) Google Cloud Console'da OAuth Client Oluşturma:
1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services > Credentials** menüsüne gidin
4. **Create Credentials > OAuth 2.0 Client ID** seçin
5. Application type: **Web application** seçin
6. **Authorized redirect URIs** kısmına ekleyin:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
7. **Create** butonuna tıklayın
8. Client ID ve Client Secret'i kopyalayın

#### b) Supabase'de Google Provider Ayarları:
1. Supabase Dashboard > Authentication > Providers > Google
2. **Enable** butonu ile aktif edin
3. Client ID ve Client Secret'i yapıştırın
4. **Save** butonuna tıklayın

**Detaylı Kılavuz:** https://supabase.com/docs/guides/auth/social-login/auth-google

---

### 3. Facebook OAuth Kurulumu

#### a) Facebook Developers'da App Oluşturma:
1. [Facebook Developers](https://developers.facebook.com/) adresine gidin
2. **My Apps > Create App** seçin
3. Use case: **Consumer** veya **Business** seçin
4. App adını girin ve oluşturun
5. **Dashboard > Add Product > Facebook Login** ekleyin
6. **Settings > Basic** menüsünden:
   - App ID'yi kopyalayın
   - App Secret'i kopyalayın
7. **Facebook Login > Settings** menüsünden:
   - **Valid OAuth Redirect URIs** kısmına ekleyin:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
8. **Save Changes** butonuna tıklayın

#### b) Supabase'de Facebook Provider Ayarları:
1. Supabase Dashboard > Authentication > Providers > Facebook
2. **Enable** butonu ile aktif edin
3. App ID ve App Secret'i yapıştırın
4. **Save** butonuna tıklayın

**Detaylı Kılavuz:** https://supabase.com/docs/guides/auth/social-login/auth-facebook

---

## ✅ Test Etme

Kurulum tamamlandıktan sonra:
1. Uygulamanın giriş sayfasına gidin (`/giris`)
2. "Google ile Giriş Yap" veya "Facebook ile Giriş Yap" butonuna tıklayın
3. İlgili provider'ın login ekranı açılmalı
4. Giriş yaptıktan sonra otomatik olarak ana sayfaya yönlendirilmelisiniz

## ⚠️ Önemli Notlar

- **Provider kurulumu yapılmadan** butonlara tıklanırsa "Provider is not enabled" hatası alırsınız
- Her iki provider için de **redirect URI'nin** doğru olduğundan emin olun
- Facebook App'i production'a almak için Facebook'un review sürecinden geçmesi gerekebilir
- Test aşamasında Facebook'ta kendinizi "Test User" olarak ekleyebilirsiniz

## 🔐 Güvenlik

- **Client Secret** değerlerini asla paylaşmayın veya frontend kodunda saklamayın
- Tüm OAuth işlemleri backend üzerinden Supabase Auth tarafından yönetilir
- Kullanıcı bilgileri güvenli bir şekilde `customers` tablosunda saklanır

## 📞 Sorun Giderme

### "Provider is not enabled" hatası:
- Supabase Dashboard'da ilgili provider'ın Enable edildiğinden emin olun
- Client ID ve Secret'in doğru girildiğini kontrol edin

### Redirect çalışmıyor:
- Redirect URI'nin hem OAuth provider'da hem de Supabase'de doğru olduğundan emin olun
- URI'nin sonunda `/` olmamalı

### Kullanıcı giriş yapmıyor:
- Browser console'da hata mesajlarını kontrol edin
- Supabase logs kısmından detaylı hata bilgilerini inceleyin
