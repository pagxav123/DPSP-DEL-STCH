
import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// URL principal del proyecto STCH
const SUPABASE_URL = "https://cnzzudupvkuvrzezybar.supabase.co";

// Clave pública de Supabase
const SUPABASE_KEY = "sb_publishable_VZE4aD6viinQqZaLkGnt1g_6Djn3mOc";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

