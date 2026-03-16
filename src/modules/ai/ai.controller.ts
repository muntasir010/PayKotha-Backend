// src/controllers/ai.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AIServices } from "./ai.service";
import { sendResponse } from "../../utils/sendResponse";

const getChatResponse = catchAsync(async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message is required" });

  const aiText = await AIServices.generateAIResponse(message);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "AI responded successfully",
    data: aiText,
  });
});

export const AIControllers = {
  getChatResponse,
};