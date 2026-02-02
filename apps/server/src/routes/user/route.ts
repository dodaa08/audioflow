import express from "express";
import { Router } from "express";
const UserRoute: Router = express.Router();
import type { Request, Response } from "express";
import { prisma } from "db";

const createUser = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Name is required",
    });
  }
  try {
    const user = await prisma.user.create({
      data: {
        name: name,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
};

UserRoute.post("/create", createUser);

export default UserRoute;
