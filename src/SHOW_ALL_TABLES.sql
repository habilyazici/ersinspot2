-- ============================================
-- TÜM TABLOLAR VE KOLONLARI GÖSTER (DÜZELTİLMİŞ)
-- ============================================

-- 1️⃣ TÜM TABLOLAR VE KOLONLARI (DETAYLI)
SELECT 
    c.table_name AS "Tablo",
    c.column_name AS "Kolon",
    c.data_type AS "Tip",
    c.is_nullable AS "Null?",
    c.column_default AS "Varsayılan"
FROM information_schema.columns c
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;


-- 2️⃣ TABLO ÖZETİ (Kaç kolon var, kaç satır var)
SELECT 
    t.table_name AS "Tablo",
    COUNT(c.column_name) AS "Kolon Sayısı",
    COALESCE(s.n_live_tup, 0) AS "Satır Sayısı"
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN pg_stat_user_tables s
    ON s.relname = t.table_name
    AND s.schemaname = 'public'
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name, s.n_live_tup
ORDER BY "Satır Sayısı" DESC NULLS LAST;


-- 3️⃣ SADECE TABLO İSİMLERİ VE SATIR SAYILARI
SELECT 
    relname AS "Tablo",
    n_live_tup AS "Satır Sayısı"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
