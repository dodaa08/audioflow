import express from "express";
import { Router } from "express";
const JobRoute: Router = express.Router();
import type { Request, Response } from "express";
import { prisma } from "db";
import crypto from "crypto";
import { AudioTranscribeQueue } from "redis";

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
    console.log("path", path);

     if (!path.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      console.log("Skipping non-audio:", path);
      return res.sendStatus(200);
    }
    

const job = await prisma.job.update({
  where: { inputUrl: path  },
  data: { status: "PROCESSING" }
});

    
    await AudioTranscribeQueue.add("transcribe", { path, jobId : job?.id
 }, {
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
    });

    console.log("Added the audio path to queue..", path);

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    return res.sendStatus(500);
  }
};

// const PushNotificationsWebhook = async (req: Request, res: Response) => {
//   const payload = req.body;
//   const path = payload?.record.name;
  
//   try {
//     // Update the db job as complted
//     const JobStatus = await prisma.job.updateMany({
//       where: { inputUrl: path },
//       data: {
//         status: "COMPLETED"
//       }
//     });

//     console.log("JOb Completed..", JobStatus);

//     // fetch the text data and send it to the user
//     const { data, error } = await supabase.storage.from("transcription").createSignedUploadUrl(path);

//     if (error) throw error;


//     // have a function here to call and push the notification to the user

//     return res.json({
//       success: true,
//       url: data.signedUrl,
//     });

//   }
//   catch (error) {
//     console.error(error);
//     return res.sendStatus(500);
//   }

// }

const JobComplete = async (req: Request, res : Response)=>{
  console.log("Triggering the job complete webhook");
  const payload = req.body;
  const url = payload?.record.name.trim();
  console.log("Path", url);
  try{
    const update = await prisma.job.update({
   where : { inputUrl : url },
   data : { status : "COMPLETED" }
});


    if(!update){
       return res.send("Failed to update the job");
    }

    res.status(200).json({
       Message : "Job Completed"
    });
    console.log("JOb completed.");
  }
  catch(error){
    console.log("Error Updating the status", error);
  }
}

JobRoute.post("/storage-webhook", Webhook);
JobRoute.post("/JobcompleteWBH", JobComplete);
JobRoute.post("/create", startJob);
JobRoute.patch("/update/:id", updateJob);

export default JobRoute;
