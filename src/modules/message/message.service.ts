import { IMessage } from './message.interface';
import { Message } from './message.model';

const sendMessageIntoDB = async (payload: IMessage) => {
  const result = await Message.create(payload);
  return result;
};

const getAllMessagesFromDB = async () => {
  const result = await Message.find().sort({ createdAt: -1 });
  return result;
};

export const MessageService = {
  sendMessageIntoDB,
  getAllMessagesFromDB,
};