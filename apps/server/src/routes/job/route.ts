import express from "express";
import { Router } from "express";
const JobRoute: Router = express.Router();
import type { Request, Response } from "express";
import { prisma } from "db";

const startJob = async (req : Request, res: Response)=>{
    const {userId} = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "UserId is required" 
      });
    }
    try{
       const userExists = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });
        
        if (!userExists) {
            return res.status(404).json({
                success: false,
                error: `User with ID ${userId} does not exist`
            });
        }
        const job = await prisma.job.create({
            data : {
                userId : parseInt(userId),
                status : "PROCESSING"
            }
        });

        res.status(201).json({ 
          success: true, 
          data: job 
        });
    }
    catch(error){
      console.error("Error creating Job:", error);
      res.status(500).json({ 
      success: false, 
      error: "Failed to create Job" 
    });
    }
}

const updateJob = async (req: Request, res : Response)=>{
    const { id } : any = req.params;
    const updatedData = req.body;
    if (!id) { 
      return res.status(400).json({ 
        success: false, 
        error: "UserId is required" 
      });
    }
    try{
      

        const updated = await prisma.job.update({
            where : {
                id : parseInt(id)
            },
            data : updatedData
        });

         res.json({  
           success: true, 
           data: updated 
         });
    }
    catch(error){
    console.error("Error updating job:", error);
    res.status(500).json({ 
      success: false,
       error: "Failed to update job" 
    });
    }
}

JobRoute.post("/create", startJob);
JobRoute.patch("/update/:id", updateJob);

export default JobRoute;