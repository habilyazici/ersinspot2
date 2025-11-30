-- Ersin Spot: sell_requests tablosunu düzeltme
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Önce mevcut sell_requests tablosunu kontrol et
DO $$ 
BEGIN
    -- Eğer tablo yoksa, tamamen yeniden oluştur
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sell_requests') THEN
        -- Tablo yoksa oluştur (tam sürüm)
        CREATE TABLE sell_requests (
            id BIGSERIAL PRIMARY KEY,
            request_number TEXT,
            customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            
            -- Product info (güncellenmiş)
            title TEXT,
            product_category TEXT,
            brand TEXT,
            model TEXT,
            year INTEGER,
            purchase_year INTEGER,
            condition TEXT NOT NULL,
            description TEXT,
            has_box BOOLEAN DEFAULT false,
            has_accessories BOOLEAN DEFAULT false,
            
            -- Pricing
            asking_price DECIMAL(10,2),
            admin_offer_price DECIMAL(10,2),
            admin_notes TEXT,
            
            -- Status
            status TEXT NOT NULL DEFAULT 'pending',
            status_history JSONB DEFAULT '[]'::jsonb,
            
            -- Pickup appointment (when admin will come to pick up the product)
            pickup_date DATE,
            pickup_time TEXT,
            
            -- Contact fallback (for non-registered users)
            name TEXT,
            email TEXT,
            phone TEXT,
            
            -- Timestamps
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tablo oluşturuldu!';
    END IF;
END $$;

-- Eksik kolonları ekle (eğer tablo zaten varsa)
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS product_category TEXT;
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS purchase_year INTEGER;
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS has_box BOOLEAN DEFAULT false;
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS has_accessories BOOLEAN DEFAULT false;
ALTER TABLE sell_requests ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;

-- title kolonunu nullable yap (zorunlu olmayabilir)
ALTER TABLE sell_requests ALTER COLUMN title DROP NOT NULL;

-- asking_price kolonunu nullable yap (zorunlu olmayabilir)
ALTER TABLE sell_requests ALTER COLUMN asking_price DROP NOT NULL;

-- Başarı mesajı
SELECT 'Tablo başarıyla güncellendi! ✅' as status;

-- Tüm kolonları listele ve kontrol et
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sell_requests'
ORDER BY ordinal_position;
