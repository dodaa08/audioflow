import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { supabase } from "../lib/supabase.js";
import {openai} from "../lib/openAi.js"

new Worker(
  "transcribe",
  async (job) => {
    const { path } = job.data;
    if(path == null){
      console.log("No paths in the queue...");
    }

    console.log("Processing:", path);

    try{
      const { data, error } = await supabase.storage
        .from("test")
        .download(path);

        if (error) throw error;
        if (!data) throw new Error("File not found in bucket");

        console.log("File downaloaded..", data);
        const ext = path.split(".").pop();
        const buffer = Buffer.from(await data.arrayBuffer());
        const file = new File([buffer], `audio.${ext}`);

        console.log("File", file);

        const transcription = await openai.audio.transcriptions.create({
          file,
          model : "whisper-1"
        });

        console.log(transcription.text);

        return { success: true };

    }
    catch(error){
      console.error(error);
      throw error;
    }

  },
  { connection: redis }
);
