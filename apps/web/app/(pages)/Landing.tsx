"use client";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { useTranscription } from "../hooks/useTranscription";
import toast from "react-hot-toast";

const Landing = ()=>{
  const fileRef = useRef<HTMLInputElement>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const userId = "1";
  const {isLoading, transcription, startLoading} = useTranscription(userId);

  useEffect(() => {
    if (transcription) {
      console.log(transcription);
    }
  }, [transcription]);

  const UploadToBucket = async () => {
    try {
      const file = fileRef.current?.files?.[0];
      if (!file) return alert("No file selected");

      startLoading();
      
      const response = await axios.post("http://localhost:8080/api/jobs/create", {
        userId: 1,
      });

      const { path } = response.data;

      // 2. Upload file to Supabase using that path
      const { data, error } = await supabase.storage
        .from("test") // your bucket name
        .upload(path, file, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw error;
      console.log("Data", data);

      // 3. Get the public URL so you can play it
      const { data: urlData } = supabase.storage
        .from("test")
        .getPublicUrl(path);

      setAudioSrc(urlData.publicUrl);
      toast.success("Transcriptions are ready");

    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8  space-y-6">

      <input ref={fileRef} type="file" accept="audio/*" className="hidden" id="file-upload" />
      <label
       htmlFor="file-upload"
       className="bg-white text-black px-6 py-3 rounded-lg font-mono cursor-pointer hover:text-gray-600 text-center">
        Choose an Audio File
      </label>
      <button onClick={UploadToBucket} className="bg-blue-400 text-white cursor-pointer hover:bg-blue-300 px-4 py-2 rounded font-mono">
         Transcribe Audio
      </button>
      {audioSrc && <audio controls src={audioSrc} />}

      <div className="flex">
         {
           isLoading && <>
              <div className="flex justify-center items-center mt-5">
                 <h1 className="text-black mt-2 font-serif">
                       Transcribing Audio files
                 </h1>
              </div>
            </>
         }
         {
           transcription && <div className="bg-white p-6 rounded-xl flex flex-col">
            <h1 className="text-black">Transcriptions:</h1>
            <h1 className="text-black font-semibold mt-8">{transcription}</h1>
            </div>
         }
        
      </div>
         </div>

    </div>
  );
}

export default Landing