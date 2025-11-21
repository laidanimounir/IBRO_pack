import { supabase } from './lib/supabase';

export async function testSupabaseConnection() {
  const { data, error } = await supabase.from('Products').select('*');
  if (error) console.error("ERROR:", error);
  else console.log("DATA:", data);
}

testSupabaseConnection();
