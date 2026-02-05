import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

export const DeadAudioQueue = new Queue("DAQ", {
  connection : redis
});