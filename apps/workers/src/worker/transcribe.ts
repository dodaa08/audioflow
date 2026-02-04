import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";

new Worker(
  "audio-transcribe",
  async (job) => {
    const { path } = job.data;

    console.log("Processing:", path);

  },
  { connection: redis }
);
