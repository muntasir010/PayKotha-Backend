import httpStatus from 'http-status-codes';
import AppError from '../../errorHelper/AppError';
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

const deleteMessageFromDB = async (id: string) => {
  const isMessageExist = await MessageModel.findById(id);

  if (!isMessageExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Message not found!");
  }

  const result = await MessageModel.findByIdAndDelete(id);
  return result;
};

export const MessageService = {
  sendMessageIntoDB,
  getAllMessagesFromDB,
  deleteMessageFromDB,
};