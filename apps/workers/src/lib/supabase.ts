import { createClient } from "@supabase/supabase-js";


export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

type PushToSupabaseParams = {
  path: string;
  file: Buffer;
  contentType?: string;
};

// Push transcriptions to bucket
export const PushtoSupabase = async ({path, file, contentType = "text/plain"}: PushToSupabaseParams)=>{
  try{
    const {data, error} = await supabase.storage.from("transcriptions").upload(path, file, {
      contentType,
      upsert: true
    });

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from("transcriptions")
        .getPublicUrl(path);

    console.log("FIle uploaded successfully", urlData);
    
    return urlData;
  }
  catch(error){
    console.error("Upload failed:", error);  
    throw error;
  }
}