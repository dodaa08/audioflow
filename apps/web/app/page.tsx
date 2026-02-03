"use client";
import { useRef, useState } from "react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Home = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);


  const UploadToBucket = async () => {
    try {
      const file = fileRef.current?.files?.[0];
      if (!file) return alert("No file selected");

      // 1. Create job, get the path
      const response = await axios.post("http://localhost:8080/api/jobs/create", {
        userId: 2,
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
    </div>
  );
};

export default Home;