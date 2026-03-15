import express from 'express';
import { MessageController } from './message.controller';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';

const router = express.Router();

router.post('/send-message', MessageController.sendMessage);
router.get('/all-messages', checkAuth(Role.ADMIN), MessageController.getAllMessages);

export const messageRoutes = router;