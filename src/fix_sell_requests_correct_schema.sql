-- Ersin Spot: sell_requests tablolarını customers tablosuna uygun şemayla yeniden oluşturma
-- ⚠️ DİKKAT: Bu işlem mevcut tüm alım taleplerini silecek!

-- Önce customers tablosunun id tipini kontrol et
DO $$ 
DECLARE
    customer_id_type TEXT;
BEGIN
    SELECT data_type INTO customer_id_type
    FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'id';
    
    RAISE NOTICE 'customers.id tipi: %', customer_id_type;
END $$;

-- 1. sell_request_images tablosunu sil (foreign key dependency)
DROP TABLE IF EXISTS sell_request_images CASCADE;

-- 2. sell_requests tablosunu sil
DROP TABLE IF EXISTS sell_requests CASCADE;

-- 3. sell_requests tablosunu customers.id tipine göre oluştur (UUID veya BIGINT)
-- customers tablosu UUID kullanıyorsa customer_id de UUID olmalı
CREATE TABLE sell_requests (
    id BIGSERIAL PRIMARY KEY,
    request_number TEXT,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,  -- UUID olarak değiştirildi
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Product info
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

-- 4. sell_request_images tablosunu oluştur
CREATE TABLE sell_request_images (
    id BIGSERIAL PRIMARY KEY,
    sell_request_id BIGINT REFERENCES sell_requests(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes oluştur
CREATE INDEX idx_sell_requests_customer_id ON sell_requests(customer_id);
CREATE INDEX idx_sell_requests_user_id ON sell_requests(user_id);
CREATE INDEX idx_sell_requests_status ON sell_requests(status);
CREATE INDEX idx_sell_requests_pickup_date ON sell_requests(pickup_date);
CREATE INDEX idx_sell_request_images_request_id ON sell_request_images(sell_request_id);

-- 6. RLS (Row Level Security) aktif et
ALTER TABLE sell_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_request_images ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies oluştur (service role tam erişim)
CREATE POLICY "Service role has full access to sell_requests"
  ON sell_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to sell_request_images"
  ON sell_request_images FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Başarı mesajı
SELECT '✅ Tablolar başarıyla oluşturuldu! (customer_id UUID olarak ayarlandı)' as status;

-- Tüm kolonları kontrol et
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sell_requests'
ORDER BY ordinal_position;
