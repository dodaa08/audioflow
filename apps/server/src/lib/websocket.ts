import { subscriber, CHANNELS } from "redis";
import type { WebSocketServer } from "ws";

const clients = new Map<string, Set<WebSocket>>();

export function setupWebSocket(wss: WebSocketServer) {
wss.on("connection", (ws : any, req) => {

  // UerId
  const url = new URL(req.url!, "http://localhost");
  const userId = url.searchParams.get("userId");

  if(!userId){
    ws.close(); 
     return;
  } 

  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }

  clients.get(userId)!.add(ws);

  console.log(`User connected: ${userId}`);

   ws.on("close", () => {
    clients.get(userId)?.delete(ws);

    // cleanup empty sets
    if (clients.get(userId)?.size === 0) {
      clients.delete(userId);
    }

    console.log(`User disconnected: ${userId}`);
  });
  
});

subscriber.subscribe(CHANNELS.TRANSCRIPTION_COMPLETE);

console.log("Subscribed to events!");
subscriber.on("message", (channel, message) => {
  if (channel === CHANNELS.TRANSCRIPTION_COMPLETE) {
    const data = JSON.parse(message);
    const userId = data.originalPath.split("/")[0];

    const sockets = clients.get(userId);

    console.log("Sockets", sockets);

sockets?.forEach((client) => {
  if (client.readyState === WebSocket.OPEN) {
    
    client.send(JSON.stringify({
      type: "TRANSCRIPTION_COMPLETE",
      data: {
        jobId: data.jobId,
        userId: data.userId,
        text: data.text,
        url: data.publicUrl,
        timestamp: data.timestamp,
      }
    }));
  }
});
  }
})
};