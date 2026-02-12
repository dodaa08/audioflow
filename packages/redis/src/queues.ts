import { Queue } from "bullmq";
import { redis } from "./Redis.js";

export const AudioTranscribeQueue = new Queue("transcribe", {
  connection: redis,
});

export const DeadAudioQueue = new Queue("DAQ", {
  connection : redis
});
