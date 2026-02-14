import { useEffect, useRef, useState } from "react";

export const useTranscription = (userId: string) => {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?userId=${userId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "TRANSCRIPTION_COMPLETE") {
        setTranscription(message.data.text);
        setIsLoading(false);
      }
    };

    ws.onerror = () => {
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log("socket closed");
    };

    return () => {
      wsRef.current?.close();
    };
  }, [userId]);

  const startLoading = () => {
    setTranscription(null);
    setIsLoading(true);
  };

  return {
    transcription,
    isLoading,
    startLoading,
  };
};
