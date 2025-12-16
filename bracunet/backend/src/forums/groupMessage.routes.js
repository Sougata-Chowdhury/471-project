import express from 'express';
import { protect } from '../middleware/auth.js';
import { getGroupMessages, postGroupMessage } from './groupMessage.controller.js';

const router = express.Router();

router.get('/:groupId/messages', protect, getGroupMessages);
router.post('/:groupId/messages', protect, postGroupMessage);

export default router;
