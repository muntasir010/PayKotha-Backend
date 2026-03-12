import express from 'express';
import { MessageController } from './message.controller';

const router = express.Router();

router.post('/send-message', MessageController.sendMessage);

export const messageRoutes = router;