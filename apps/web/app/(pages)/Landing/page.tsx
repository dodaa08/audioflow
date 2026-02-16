"use client";

import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../lib/supabase";
import { useTranscription } from "../../hooks/useTranscription";
import toast from "react-hot-toast";
import { SupabaseConfigs } from "../../lib/supabase";

const Landing = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const userId = process.env.NEXT_PUBLIC_DUMMY_USER || "1";
  const { isLoading, transcription, startLoading, isCompleted, isFailed } =
    useTranscription(userId);
  const BackendUrl = process.env.NEXT_PUBLIC_BACKENDURL || "";

  useEffect(() => {
    if (transcription) {
      toast.success("Audio file transcribed successfully!");
    }
  }, [transcription]);

  const UploadToBucket = async () => {
    try {
      const file = fileRef.current?.files?.[0];
      if (!file) return alert("No file selected");

      startLoading();

      const response = await axios.post(
        `${BackendUrl}/api/jobs/create`,
        { userId }
      );

      const { path } = response.data;

      const { error } = await supabase.storage
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
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleFileChange = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    console.log("LocalObject url", localUrl);
    setAudioSrc(localUrl);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 px-4">

     
      <div className="text-center mt-10 space-y-2">
        <h1 className="text-3xl font-semibold text-black">
          AudioFlow
        </h1>
        <p className="text-gray-600">
          Get AI transcriptions in one click
        </p>
      </div>

      
      <div className="flex-1 flex items-center justify-center">
        
        <div className="flex flex-col items-center space-y-6 w-full max-w-md">

          <input
            type="file"
            ref={fileRef}
            accept="audio/*"
            className="hidden"
            id="file-upload"
            onChange={handleFileChange}
          />

           {audioSrc && (
            <audio controls className="w-full">
              <source src={audioSrc} />
              Your browser does not support the audio element.
            </audio>
          )}

          <label
            htmlFor="file-upload"
            className="bg-white text-black px-6 py-3 rounded-lg cursor-pointer hover:bg-gray-50 transition"
          >
            Choose an Audio File
          </label>


          {isLoading && !isCompleted && !isFailed && (
            <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )
        }
          

          {!isLoading && !isCompleted && (
            <button
              disabled={!fileRef.current?.files?.length}
              onClick={UploadToBucket}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium 
              hover:bg-blue-700 transition 
              disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Transcribe
            </button>
          )}

          {isCompleted && (
            <h1
              className="bg-green-500 text-white px-6 py-2.5 rounded-lg font-medium"
            >
              Completed 
            </h1>
          )}

          {transcription && (
            <div className="bg-white p-6 rounded-xl shadow-sm w-full">
              <h2 className="text-black font-semibold">
                {transcription}
              </h2>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Landing;
