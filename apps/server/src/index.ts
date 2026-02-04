// src/index.ts
import dotenv from "dotenv";

// Load env IMMEDIATELY, before any other imports
dotenv.config();

// Now all other imports
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import UserRoute from "./routes/user/route.js";
import JobRoute from  "./routes/job/route.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin : "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API's
app.use("/api/users", UserRoute);
app.use("/api/jobs", JobRoute);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the API" });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString() 
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});