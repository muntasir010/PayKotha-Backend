import { IMessage } from './message.interface';
import { Message } from './message.model';

const sendMessageIntoDB = async (payload: IMessage) => {
  const result = await Message.create(payload);
  return result;
};


export const MessageService = {
  sendMessageIntoDB,
};