import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const SupabaseConfigs = {
  Buckets : {
    Audio : process.env.NEXT_PUBLIC_AUDIO_BUCKET || "",
    Transcriptions : process.env.NEXT_PUBLIC_TRANSCRIPTIONS_BUCKET
  }
}