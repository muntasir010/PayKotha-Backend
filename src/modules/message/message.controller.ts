import httpStatus from "http-status-codes";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { MessageService } from "./message.service";
import { sendResponse } from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const sendMessage = async (req: Request, res: Response) => {
  try {
    const result = await MessageService.sendMessageIntoDB(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Message sent successfully",
      data: result,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error: err });
  }
};

const getAllMessages = async (req: Request, res: Response) => {
  try {
    const result = await MessageService.getAllMessagesFromDB();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Message retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

const deleteMessage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MessageService.deleteMessageFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message deleted successfully",
    data: result,
  });
});

export const MessageController = {
  sendMessage,
  getAllMessages,
  deleteMessage,
};
