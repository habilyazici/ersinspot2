-- Ersin Spot: customer_id kolonunu UUID'den BIGINT'e çevirme
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Önce mevcut foreign key constraint'leri kaldır (varsa)
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'sell_requests'::regclass 
        AND contype = 'f'
        AND conname LIKE '%customer%'
    LOOP
        EXECUTE 'ALTER TABLE sell_requests DROP CONSTRAINT IF EXISTS ' || constraint_name;
        RAISE NOTICE 'Constraint kaldırıldı: %', constraint_name;
    END LOOP;
END $$;

-- customer_id kolonunu UUID'den BIGINT'e çevir
ALTER TABLE sell_requests 
ALTER COLUMN customer_id TYPE BIGINT USING customer_id::text::bigint;

-- Foreign key constraint'i yeniden ekle (customers tablosu varsa)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
        ALTER TABLE sell_requests 
        ADD CONSTRAINT sell_requests_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key constraint eklendi!';
    ELSE
        RAISE NOTICE 'customers tablosu bulunamadı - constraint eklenmedi';
    END IF;
END $$;

-- Başarı mesajı
SELECT 'customer_id kolonu başarıyla BIGINT''e çevrildi! ✅' as status;

-- Güncellenmiş customer_id kolonunu kontrol et
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'sell_requests' 
AND column_name = 'customer_id';
