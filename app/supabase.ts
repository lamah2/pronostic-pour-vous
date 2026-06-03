import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://edtnnlrzdnykdyiyomhe.supabase.co";

const supabaseKey = "sb_publishable_wGHvVhCDM7U3Rtg897T7Pw_0-WdY85P";

export const supabase = createClient(supabaseUrl, supabaseKey);