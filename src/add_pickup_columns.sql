-- Ersin Spot: sell_requests tablosuna randevu kolonları ekleme
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- pickup_date kolonu ekle
ALTER TABLE sell_requests 
ADD COLUMN IF NOT EXISTS pickup_date DATE;

-- pickup_time kolonu ekle  
ALTER TABLE sell_requests 
ADD COLUMN IF NOT EXISTS pickup_time TEXT;

-- Başarı mesajı
SELECT 'Kolonlar başarıyla eklendi! ✅' as status;

-- Tabloyu kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sell_requests' 
AND column_name IN ('pickup_date', 'pickup_time');
