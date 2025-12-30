
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpbkapfukjsutdxogrgq.supabase.co';
const supabaseAnonKey = 'sb_publishable_FQbFshCQF-yhONAOA8Ih-w_1RoLGYsi';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
