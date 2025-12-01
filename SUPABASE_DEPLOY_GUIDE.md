# Ersin Spot - Supabase Edge Functions Deploy Rehberi

## 📋 Hazırlık

Dosya yapısı düzeltildi ve Supabase Edge Functions için hazır hale getirildi:

```
supabase/
├── config.toml
├── functions/
│   ├── deno.json (✅ YENİ - Import mappings)
│   └── make-server-0f4d2485/
│       └── index.ts (✅ DÜZELTİLDİ - Ana server'ı import ediyor)
│
src/
└── supabase/
    └── functions/
        └── server/
            ├── index.tsx (✅ DÜZELTİLDİ - Export edildi)
            ├── auth.tsx
            ├── cart.tsx
            ├── orders.tsx
            ├── kv_store.tsx
            ├── moving.tsx
            ├── technical_service.tsx
            ├── admin-dashboard.tsx
            ├── admin-availability.tsx
            ├── user-services.tsx
            ├── user-sell-requests.tsx
            ├── user-orders.tsx
            └── user-profile.tsx
```

## 🚀 Deploy Adımları

### 1. Supabase CLI Kurulumu (Eğer kurulu değilse)

```powershell
# PowerShell'de çalıştırın:
iwr https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip -OutFile supabase.zip
Expand-Archive supabase.zip -DestinationPath $env:USERPROFILE\bin
$env:PATH += ";$env:USERPROFILE\bin"
```

### 2. Supabase'e Giriş Yapın

```powershell
supabase login
```

Bu komut bir browser açacak ve Supabase hesabınıza giriş yapmanızı isteyecek.

### 3. Projeyi Bağlayın

```powershell
# Proje klasörüne gidin
cd c:\Users\habil\OneDrive\Belgeler\GitHub\ersinspot2

# Supabase projenizi bağlayın (Supabase Dashboard'dan Project ID'nizi alın)
supabase link --project-ref YOUR_PROJECT_REF
```

Project Ref'i bulmak için: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/general

### 4. Environment Variables'ı Ayarlayın

Edge Functions'ın çalışması için gerekli environment variables:

```powershell
# Supabase Dashboard'dan bu bilgileri alın ve ayarlayın:
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="your-anon-key"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT.supabase.co:5432/postgres"
```

**Bilgileri Nerede Bulacaksınız:**
- Supabase Dashboard → Project Settings → API
- `SUPABASE_URL`: URL
- `SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (dikkatli kullanın!)
- `SUPABASE_DB_URL`: Database → Connection String → Direct Connection

### 5. Function'ı Deploy Edin

```powershell
# Ana function'ı deploy edin
supabase functions deploy make-server-0f4d2485
```

### 6. Deploy'u Test Edin

```powershell
# Health check endpoint'ini test edin
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-0f4d2485/health
```

Ya da browser'da açın:
```
https://YOUR_PROJECT.supabase.co/functions/v1/make-server-0f4d2485/health
```

Başarılı olursa `{"status":"ok"}` yanıtı almalısınız.

## 🔧 Sorun Giderme

### Hata: "Cannot find module"
Eğer import hataları alırsanız:
```powershell
# deno.json dosyasını kontrol edin
cat supabase\functions\deno.json
```

### Hata: "Environment variable not found"
Tüm secrets'ları ayarladığınızdan emin olun:
```powershell
supabase secrets list
```

### Hata: "Permission denied"
Service role key'i doğru ayarladığınızdan emin olun.

### Deploy Loglarını Görüntüleme

```powershell
# Real-time log'ları izleyin
supabase functions logs make-server-0f4d2485 --follow
```

## 📝 Önemli Notlar

1. ✅ **Local dosyalarınız düzeltildi** - `src/supabase/functions/server/index.tsx` artık export ediyor
2. ✅ **Supabase entry point düzeltildi** - `supabase/functions/make-server-0f4d2485/index.ts` ana server'ı import ediyor
3. ✅ **Import mappings eklendi** - `supabase/functions/deno.json` oluşturuldu
4. ⚠️ **Secrets mutlaka ayarlanmalı** - Yukarıdaki environment variables olmadan çalışmaz

## 🎯 Frontend Konfigürasyonu

Frontend'inizde API base URL'i şu şekilde olmalı:

```typescript
// src/services/api.ts veya ilgili dosyada
const API_BASE_URL = 'https://YOUR_PROJECT.supabase.co/functions/v1';
```

## 🆘 Hala Sorun mu Var?

1. Supabase Dashboard → Functions → make-server-0f4d2485 → Logs bölümüne bakın
2. Browser Console'da network tab'ı kontrol edin
3. CORS hatası alıyorsanız, function'da CORS ayarları doğru yapılandırılmış (kodda halledildi)

---

**Hazırlayan:** GitHub Copilot
**Tarih:** 1 Aralık 2025
