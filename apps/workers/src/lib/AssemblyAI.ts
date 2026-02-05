// Install the assemblyai package by executing the command "npm install assemblyai"

import { AssemblyAI } from "assemblyai";

export const client = new AssemblyAI({
  apiKey: "d9a83542b0d24a209f91bbb95d6b3376",
});

// const audioFile = "./local_file.mp3";
// const audioFile = 'https://assembly.ai/wildfires.mp3'

// const params = {
//   audio: audioFile,
//   "language_detection": true,
//   // Uses universal-3-pro for en, es, de, fr, it, pt. Else uses universal-2 for support across all other languages
//   "speech_models": ["universal-3-pro", "universal-2"]
// };

// const run = async () => {
//   const transcript = await client.transcripts.transcribe(params);

//   console.log(transcript.text);
// };

// run();