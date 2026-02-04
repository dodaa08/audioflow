import express from "express";
import { Router } from "express";
const JobRoute: Router = express.Router();
import type { Request, Response } from "express";
import { prisma } from "db";
import crypto from "crypto";
import { AudioTranscribeQueue } from "../../queues/transcription.queue.js";


const startJob = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: "UserId is required",
    });
  }

  const path = `${userId}/${crypto.randomUUID()}.mp3`;

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: `User with ID ${userId} does not exist`,
      });
    }

    const job = await prisma.job.create({
      data: {
        userId: parseInt(userId),
        status: "PENDING",
        inputUrl: path,
      },
    });

    // just return the job and path, frontend handles the upload
    res.status(201).json({
      success: true,
      data: job,
      path: path,
    });
  } catch (error) {
    console.error("Error creating Job:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create Job",
    });
  }
};

const updateJob = async (req: Request, res: Response) => {
  const { id }: any = req.params;
  const updatedData = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Id is required",
    });
  }

  try {
    const updated = await prisma.job.update({
      where: {
        id: parseInt(id),
      },
      data: updatedData,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update job",
    });
  }
};

const Webhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const path = payload?.record.name;

    const job = await prisma.job.updateMany({
      where: { inputUrl: path, status : "PENDING" },
      data: {
        status: "PROCESSING",
      },
    });

    if(job.count == 0){
      console.log("Ended here at job count 0..");
      return res.sendStatus(200);
    }

    // push the path to the queue;
    await AudioTranscribeQueue.add("transcribe", {path}, {
      jobId : path,
      attempts : 5,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
    console.log("Added the audio path to queue..", path);

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    return res.sendStatus(500);
  }
};

JobRoute.post("/storage-webhook", Webhook);
JobRoute.post("/create", startJob);
JobRoute.patch("/update/:id", updateJob);

export default JobRoute;