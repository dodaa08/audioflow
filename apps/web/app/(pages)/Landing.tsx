"use client";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { useTranscription } from "../hooks/useTranscription";

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

    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col justify-center items-center gap-4">
      <input ref={fileRef} type="file" accept="audio/*" className="text-white" />
      <button onClick={UploadToBucket} className="bg-white text-black px-4 py-2 rounded">
        Upload
      </button>
      {audioSrc && <audio controls src={audioSrc} />}

      <div className="flex">
         {
            isLoading && <>
              <div className="flex justify-center">
                 <h1 className="text-white text-center mt-2">
                     Uploaded Loading the transcriptions...
                 </h1>
              </div>
            </>
         }
         {
            transcription && <>
            <h1 className="text-2xl text-white text-bold">Transcriptions: {transcription}</h1>
            </>
         }
        
      </div>

    </div>
  );
}

export default Landing