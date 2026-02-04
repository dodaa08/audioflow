import { Worker } from "bullmq";
import { redis } from "../lib/redis.js"; // or shared lib
import { prisma } from "db";

new Worker(
  "audio-transcribe",
  async (job) => {
    const { path } = job.data;

    console.log("Processing:", path);

    await prisma.job.updateMany({
      where: { inputUrl: path },
      data: { status: "COMPLETED" },
    });
  },
  { connection: redis }
);
