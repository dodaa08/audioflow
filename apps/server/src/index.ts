import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Routes
import UserRoute from "./routes/user/route.js";
import JobRoute from  "./routes/job/route.js";

// Middleware
app.use(cors());
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