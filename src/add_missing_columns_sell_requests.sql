-- Ersin Spot: sell_requests tablosuna eksik kolonları ekleme
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- product_category kolonu ekle
ALTER TABLE sell_requests 
ADD COLUMN IF NOT EXISTS product_category TEXT;

-- purchase_year kolonu ekle
ALTER TABLE sell_requests 
ADD COLUMN IF NOT EXISTS purchase_year INTEGER;

-- has_box kolonu ekle (ürünün kutusu var mı?)
ALTER TABLE sell_requests 
ADD COLUMN IF NOT EXISTS has_box BOOLEAN DEFAULT false;

-- has_accessories kolonu ekle (aksesuarları var mı?)
ALTER TABLE sell_requests 
ADD COLUMN IF NOT EXISTS has_accessories BOOLEAN DEFAULT false;

-- Başarı mesajı
SELECT 'Tüm eksik kolonlar başarıyla eklendi! ✅' as status;

-- Tabloyu kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sell_requests' 
AND column_name IN ('product_category', 'purchase_year', 'has_box', 'has_accessories', 'pickup_date', 'pickup_time')
ORDER BY column_name;
