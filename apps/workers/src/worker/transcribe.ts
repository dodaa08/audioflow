import { supabase } from "../lib/supabase.js";
import { client } from "../lib/AssemblyAI.js";
import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { DeadAudioQueue } from "../queues/DeadQueue.js";
import { prisma } from "db";
import { PushtoSupabase } from "../lib/supabase.js";


export async function transcribeAudio(path: string) {
  if (!path) throw new Error("Path required");

  console.log("Processing:", path);

  const { data, error } = await supabase.storage
    .from("test")
    .createSignedUrl(path, 60);

  if (error) throw error;

  const transcript = await client.transcripts.transcribe({
    audio: data.signedUrl,
    language_detection: true,
    speech_models: ["universal-2"],
  });
  
  return transcript.text;
}


const worker = new Worker(
  "transcribe",
  async (job) => {
    const { path } = job.data;

    if (!path) {
      console.log("No paths in the queue...");
      return;
    }

    const text = await transcribeAudio(path);

    if (!text) {
    throw new Error("Transcript text missing");
  }

  if(text == ""){
      console.log("No words found in the audio");
      return {
        success : true,
        message : "Audio did not have text"
      }
  }

  console.log("Transcript:", text);

  const buffer = Buffer.from(text, "utf-8");

  await PushtoSupabase({
    path : `${path}.txt`,
    file : buffer
  });
  console.log("File uploaded to the bucket..");  

  return;

  },
  { connection: redis, concurrency: 3,}
);

worker.on("failed", async (job, err) => {
  if (!job) return;

  if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
    console.log("Moving job to Dead Queue:", job.id);

    await DeadAudioQueue.add("DAQ", job.data, {
      removeOnComplete: false,
    });

    await prisma.job.updateMany({
      where: { inputUrl: job.data.path },
      data: { status: "FAILED" },
    });

    return;
  }

  if(err) {
    console.log("Error", err);
    return;
  }
});