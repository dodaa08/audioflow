import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

export const AudioTranscribeQueue = new Queue("transcribe", {
  connection: redis,
});