import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('documents').select('*').limit(1);
    if (error) {
      console.error("❌ Supabase error:", error);
    } else {
      console.log("✅ Supabase connection works. Sample data:", data);
    }
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testConnection();
