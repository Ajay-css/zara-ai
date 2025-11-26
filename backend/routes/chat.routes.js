// routes/chat.routes.js
import { Router } from 'express';
import { 
  getChatHistory, 
  sendMessage, 
  getMessages, 
  deleteMessage,
  clearChatHistory,
  analyzeImage,
  upload,
  getAIModels,
  switchAIModel
} from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/history', getChatHistory);
router.post('/send', sendMessage);
router.post('/analyze-image', upload.single('image'), analyzeImage);
router.get('/user/:userId', getMessages);
router.delete('/message/:messageId', deleteMessage);
router.delete('/clear', clearChatHistory);
router.get('/models', getAIModels);
router.post('/switch-model', switchAIModel);

export default router;