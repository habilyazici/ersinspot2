# 🚀 Supabase Edge Functions - Manuel Deploy Rehberi

## ❗ Önemli Not

Supabase Edge Functions, projenizin dışındaki dosyalara relative import yapamıyor. Bu yüzden iki seçeneğimiz var:

### Seçenek 1: GitHub'dan Deploy (ÖNERİLEN) ⭐

1. **Kodunuzu GitHub'a push edin:**
```powershell
git add .
git commit -m "Fix Supabase Edge Functions structure"
git push origin main
```

2. **Supabase Dashboard'da:**
   - https://supabase.com/dashboard/project/YOUR_PROJECT/functions adresine gidin
   - "Deploy a new function" butonuna tıklayın
   - "Import from GitHub" seçeneğini seçin
   - Repository'nizi seçin
   - Branch: `main`
   - Function path: `supabase/functions/make-server-0f4d2485`
   - Deploy butonuna tıklayın

### Seçenek 2: Supabase CLI ile Deploy

Supabase CLI'yi kurmak için Scoop kullanın (en kolay yöntem):

```powershell
# 1. Scoop'u kur (eğer yoksa)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# 2. Supabase CLI'yi kur
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 3. Login ol
supabase login

# 4. Projeyi bağla
supabase link --project-ref YOUR_PROJECT_REF

# 5. Secrets'ları ayarla
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="your-anon-key"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set SUPABASE_DB_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"

# 6. Deploy et
supabase functions deploy make-server-0f4d2485
```

### Seçenek 3: Tüm Kodu Tek Dosyada Birleştir

Eğer yukarıdaki yöntemler işe yaramazsa, tüm modülleri tek bir dosyada birleştirmemiz gerekir. Bu durumda:

1. Tüm `*.tsx` dosyalarını tek bir büyük dosyaya birleştirin
2. Import statement'ları kaldırın
3. Supabase Dashboard'dan manuel olarak kopyala-yapıştır yapın

## 🎯 Hangi Yöntemi Seçmeliyim?

- **GitHub hesabınız varsa ve kod orada ise:** Seçenek 1 (En Kolay)
- **Terminal işlemlerinden rahatsanız:** Seçenek 2 (En Stabil)
- **Hiçbiri işe yaramazsa:** Seçenek 3 (Son Çare)

## ✅ Deploy Sonrası Test

```powershell
# Health check
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-0f4d2485/health

# Veya browser'da:
# https://YOUR_PROJECT.supabase.co/functions/v1/make-server-0f4d2485/health
```

Başarılı: `{"status":"ok"}`

## 🔧 Environment Variables

Mutlaka ayarlanması gerekenler:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Bu değerleri Supabase Dashboard → Settings → API ve Database bölümlerinden alabilirsiniz.
