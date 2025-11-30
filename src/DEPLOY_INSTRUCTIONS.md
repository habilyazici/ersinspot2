# 🚀 Backend Deployment Talimatları

## Değişiklikler
Backend kodlarında düzeltme yapıldı:
- ✅ Admin kontrolü için `customers.id` yerine `customers.auth_user_id` kullanılıyor
- ✅ `sell_requests` INSERT sorgusu güncellendi (yeni kolonlar eklendi)
- ✅ CREATE TABLE SQL'leri güncellendi

## Deploy Adımları

### Yöntem 1: Supabase Dashboard (Önerilen)
1. **Supabase Dashboard** → **Edge Functions**
2. `make-server-0f4d2485` fonksiyonunu bulun
3. **Redeploy** butonuna tıklayın
4. Deploy tamamlanınca sayfayı yenileyin

### Yöntem 2: Manuel Kod Değişikliği
Eğer deploy çalışmazsa:
1. **Supabase Dashboard** → **Edge Functions** → `make-server-0f4d2485`
2. Kodu düzenle
3. Satır 5412'yi bulun: `.eq('id', user.id)`
4. Şununla değiştirin: `.eq('auth_user_id', user.id)`
5. **Save & Deploy**

### Test
Deploy sonrası:
1. Admin olarak giriş yapın
2. Hızlı Erişim sayfasını açın
3. İstatistik kartlarının yüklendiğini kontrol edin
4. Console'da hata olmamalı

## Beklenen Sonuç
✅ Bugünkü istatistikler başarıyla yüklenmeli
✅ 4 istatistik kartı doğru değerleri göstermeli
