// controllers/chat.controller.js
import Message from '../models/Message.model.js';
import groqService from '../services/groq.service.js';
import multer from 'multer';
import path from 'path';

// Configure multer
const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    mimetype && extname ? cb(null, true) : cb(new Error('Only image files allowed'));
  }
});

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: 1 });

    res.json({ 
      success: true, 
      data: messages, 
      count: messages.length 
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat history' 
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;
    const userId = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message content is required' 
      });
    }

    // Get recent chat history
    const recentMessages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
    .sort({ createdAt: -1 })
    .limit(4)
    .populate('sender', 'name email')
    .populate('recipient', 'name email');

    // Save user message
    const userMessage = new Message({
      sender: userId,
      recipient: Message.getAIUserId(),
      content: content.trim(),
      messageType
    });
    await userMessage.save();

    // Generate AI response
    const aiResponse = await groqService.generateResponse(content, recentMessages.reverse());

    // Save AI response
    const aiMessage = new Message({
      sender: Message.getAIUserId(),
      recipient: userId,
      content: aiResponse,
      messageType: 'text'
    });
    await aiMessage.save();

    const populatedAiMessage = await Message.findById(aiMessage._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    res.json({ 
      success: true, 
      data: populatedAiMessage, 
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message' 
    });
  }
};

// Get messages for specific user
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages' 
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({ 
      _id: messageId, 
      sender: userId 
    });

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ 
      success: true, 
      message: 'Message deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete message' 
    });
  }
};

// Clear chat history
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const aiUserId = Message.getAIUserId();

    await Message.deleteMany({
      $or: [
        { sender: userId, recipient: aiUserId },
        { sender: aiUserId, recipient: userId }
      ]
    });

    res.json({ 
      success: true, 
      message: 'Chat history cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear chat history' 
    });
  }
};

// Image analysis
export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    const { prompt = "What's in this image?" } = req.body;
    const userId = req.user.id;

    const analysis = await groqService.analyzeImage(
      req.file.buffer, 
      req.file.mimetype, 
      prompt
    );

    const imageMessage = new Message({
      sender: Message.getAIUserId(),
      recipient: userId,
      content: `📸 Image Analysis:\n\n${analysis}`,
      messageType: 'image_analysis'
    });
    await imageMessage.save();

    const populatedMessage = await Message.findById(imageMessage._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    res.json({ 
      success: true, 
      data: populatedMessage, 
      message: 'Image analyzed successfully' 
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze image' 
    });
  }
};

// Get AI models
export const getAIModels = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        models: groqService.getAvailableModels(),
        currentModel: groqService.currentModel
      }
    });
  } catch (error) {
    console.error('Error getting AI models:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get AI models' 
    });
  }
};

// Switch AI model
export const switchAIModel = async (req, res) => {
  try {
    const { model } = req.body;
    
    if (!model) {
      return res.status(400).json({ 
        success: false, 
        message: 'Model name is required' 
      });
    }

    const success = groqService.setModel(model);
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Switched to ${model}`, 
        currentModel: model 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Model not available' 
      });
    }
  } catch (error) {
    console.error('Error switching AI model:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to switch AI model' 
    });
  }
};