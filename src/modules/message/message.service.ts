import { IMessage } from './message.interface';
import { MessageModel } from './message.model';

const sendMessageIntoDB = async (payload: IMessage) => {
  const result = await MessageModel.create(payload);
  return result;
};

const getAllMessagesFromDB = async () => {
  const result = await MessageModel.find().sort({ createdAt: -1 });
  return result;
};

export const MessageService = {
  sendMessageIntoDB,
  getAllMessagesFromDB,
};