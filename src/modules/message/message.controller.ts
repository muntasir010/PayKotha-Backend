import { Request, Response } from 'express';
import { MessageService } from './message.service';

const sendMessage = async (req: Request, res: Response) => {
  try {
    const result = await MessageService.sendMessageIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: 'Message sent successfully!',
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong', error: err });
  }
};


export const MessageController = {
  sendMessage,
};