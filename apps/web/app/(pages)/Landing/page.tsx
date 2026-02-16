"use client";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../lib/supabase";
import { useTranscription } from "../../hooks/useTranscription";
import toast from "react-hot-toast";
import { SupabaseConfigs } from "../../lib/supabase";

const Landing = ()=>{
  const fileRef = useRef<HTMLInputElement>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const userId = process.env.NEXT_PUBLIC_DUMMY_USER || "1";
  const {isLoading, transcription, startLoading} = useTranscription(userId);
  const BackendUrl = process.env.NEXT_PUBLIC_BACKENDURL || "";

  useEffect(() => {
    if (transcription) {
        toast.success("Audio File transcribed, they are ready!");
    }
  }, [transcription]);

//   useEffect(() => {
//   return () => {
//     if (audioSrc?.startsWith("blob:")) {
//       URL.revokeObjectURL(audioSrc);
//     }
//   };
// }, [audioSrc]);


  const UploadToBucket = async () => {
    try {
      const file = fileRef.current?.files?.[0];
      if (!file) return alert("No file selected");

      startLoading();
      
      const response = await axios.post(`${BackendUrl}/api/jobs/create`, {userId});

      const { path } = response.data;

     
      const { data, error } = await supabase.storage
        .from(SupabaseConfigs.Buckets.Audio)
        .upload(path, file, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw error;

     
      const { data: urlData } = supabase.storage
        .from(SupabaseConfigs.Buckets.Audio)
        .getPublicUrl(path);

      setAudioSrc(urlData.publicUrl);
      toast.success("Transcriptions are ready");

    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleFileChange = () => {
  const file = fileRef.current?.files?.[0];
  if (!file) return;

  const localUrl = URL.createObjectURL(file);
  setAudioSrc(localUrl);
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8  space-y-6">

      <input ref={fileRef} type="file" accept="audio/*" className="hidden" id="file-upload" onChange={handleFileChange} />
      <label
       htmlFor="file-upload"
       className="bg-white text-black px-6 py-3 rounded-lg font-mono cursor-pointer hover:text-gray-600 text-center">
        Choose an Audio File
      </label>

      {audioSrc && (
  <div className="mt-4">
    <audio controls className="w-full">
      <source src={audioSrc} />
      Your browser does not support the audio element.
    </audio>
  </div>
)}

      <div className="flex">
         {isLoading ? (
  <div className="flex justify-center">
    <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
) : (
  <button
    onClick={UploadToBucket}
    className="bg-blue-400 text-white cursor-pointer hover:bg-blue-300 px-4 py-2 rounded font-mono"
  >
    Transcribe Audio
  </button>
)}
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