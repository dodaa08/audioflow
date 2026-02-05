import dotenv from "dotenv";
import { Redis } from "ioredis";

dotenv.config();

console.log("🔍 Creating Redis connection...");
console.log("🔍 REDIS_URL exists:", !!process.env.REDIS_URL);
console.log("🔍 REDIS_URL value:", process.env.REDIS_URL?.substring(0, 30) + "...");

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});


