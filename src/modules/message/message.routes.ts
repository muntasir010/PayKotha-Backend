import express from 'express';
import { MessageController } from './message.controller';

const router = express.Router();

router.post('/send-message', MessageController.sendMessage);
router.get('/all-messages', MessageController.getAllMessages);

export const messageRoutes = router;