import { Worker } from "bullmq";
import { redis } from "../lib/redis.js"; // or shared lib

new Worker(
  "audio-transcribe",
  async (job) => {
    const { path } = job.data;

    console.log("Processing:", path);

  },
  { connection: redis }
);
