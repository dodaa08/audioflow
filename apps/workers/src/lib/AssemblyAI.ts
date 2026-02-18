import dotenv from "dotenv";
dotenv.config();

import { AssemblyAI } from "assemblyai";

export const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_APIKEY || "",
});
