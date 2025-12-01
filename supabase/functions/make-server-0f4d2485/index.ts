// Ersin Spot Backend - Supabase Edge Function Entry Point
// Ana server dosyasını import et ve serve et
import app from "../../../src/supabase/functions/server/index.tsx";

console.log("🚀 Ersin Spot Backend Server starting from Supabase Edge Functions...");

// Supabase Edge Functions için Deno.serve kullan
Deno.serve(app.fetch);
