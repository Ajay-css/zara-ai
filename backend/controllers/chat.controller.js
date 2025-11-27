import Message from '../models/Message.model.js';
import groqService from '../services/groq.service.js';
import multer from 'multer';
import path from 'path';

// Configure multer for image uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
});

// Get complete chat history for current user
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const aiUserId = Message.getAIUserId();
    
    console.log(`📖 Fetching chat history for user: ${userId}`);

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: aiUserId },
        { sender: aiUserId, recipient: userId }
      ]
    })
    .populate('sender', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .sort({ createdAt: 1 }) // Oldest first for proper chat flow
    .lean();

    console.log(`✅ Found ${messages.length} messages in history`);

    res.json({ 
      success: true, 
      data: messages,
      count: messages.length,
      message: 'Chat history retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat history',
      error: error.message 
    });
  }
};

// Send new message
export const sendMessage = async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;
    const userId = req.user.id;
    const aiUserId = Message.getAIUserId();

    console.log(`💬 New message from user ${userId}:`, content?.substring(0, 100));

    // Validate input
    if (!content?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message content is required' 
      });
    }

    // Get recent chat history for context (last 6 messages)
    const recentMessages = await Message.find({
      $or: [
        { sender: userId, recipient: aiUserId },
        { sender: aiUserId, recipient: userId }
      ]
    })
    .sort({ createdAt: -1 }) // Get latest first
    .limit(6)
    .populate('sender', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .lean();

    console.log(`📚 Using ${recentMessages.length} recent messages for context`);

    // Save user message
    const userMessage = new Message({
      sender: userId,
      recipient: aiUserId,
      content: content.trim(),
      messageType: messageType,
      timestamp: new Date()
    });

    await userMessage.save();
    console.log('✅ User message saved');

    // Generate AI response with chat history context
    const aiResponse = await groqService.generateResponse(
      content.trim(), 
      recentMessages.reverse() // Reverse to chronological order
    );

    console.log('🤖 AI Response generated:', aiResponse?.substring(0, 100));

    // Save AI response
    const aiMessage = new Message({
      sender: aiUserId,
      recipient: userId,
      content: aiResponse,
      messageType: 'text',
      timestamp: new Date()
    });

    await aiMessage.save();
    console.log('✅ AI message saved');

    // Populate the AI message with sender details
    const populatedAiMessage = await Message.findById(aiMessage._id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .lean();

    res.json({ 
      success: true, 
      data: populatedAiMessage, 
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message',
      error: error.message 
    });
  }
};

// Get messages between current user and specific user
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    console.log(`📨 Fetching messages between ${currentUserId} and ${userId}`);

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
    .populate('sender', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .sort({ createdAt: 1 }) // Oldest first
    .lean();

    console.log(`✅ Found ${messages.length} messages between users`);

    res.json({ 
      success: true, 
      data: messages,
      count: messages.length,
      message: 'Messages retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages',
      error: error.message 
    });
  }
};

// Delete specific message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    console.log(`🗑️ Deleting message ${messageId} for user ${userId}`);

    if (!messageId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message ID is required' 
      });
    }

    // Find message and verify ownership
    const message = await Message.findOne({ 
      _id: messageId, 
      sender: userId // User can only delete their own messages
    });

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found or you do not have permission to delete it' 
      });
    }

    await Message.findByIdAndDelete(messageId);
    console.log('✅ Message deleted successfully');

    res.json({ 
      success: true, 
      message: 'Message deleted successfully',
      deletedMessageId: messageId 
    });
    
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete message',
      error: error.message 
    });
  }
};

// Clear entire chat history with AI
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const aiUserId = Message.getAIUserId();

    console.log(`🧹 Clearing chat history for user ${userId} with AI`);

    const result = await Message.deleteMany({
      $or: [
        { sender: userId, recipient: aiUserId },
        { sender: aiUserId, recipient: userId }
      ]
    });

    console.log(`✅ Cleared ${result.deletedCount} messages from chat history`);

    res.json({ 
      success: true, 
      message: 'Chat history cleared successfully',
      deletedCount: result.deletedCount 
    });
    
  } catch (error) {
    console.error('❌ Error clearing chat history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear chat history',
      error: error.message 
    });
  }
};

// Analyze uploaded image
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
    const aiUserId = Message.getAIUserId();

    console.log(`📸 Analyzing image for user ${userId}, size: ${req.file.size} bytes`);

    // Validate file size
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image size should be less than 5MB' 
      });
    }

    // Analyze image using Groq service
    const analysis = await groqService.analyzeImage(
      req.file.buffer, 
      req.file.mimetype, 
      prompt
    );

    console.log('✅ Image analysis completed');

    // Save image analysis message
    const imageMessage = new Message({
      sender: aiUserId,
      recipient: userId,
      content: `📸 **Image Analysis Request:** ${prompt}\n\n${analysis}`,
      messageType: 'image_analysis',
      imageInfo: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        prompt: prompt
      },
      timestamp: new Date()
    });

    await imageMessage.save();

    // Populate the message with sender details
    const populatedMessage = await Message.findById(imageMessage._id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .lean();

    res.json({ 
      success: true, 
      data: populatedMessage, 
      message: 'Image analyzed successfully' 
    });

  } catch (error) {
    console.error('❌ Error analyzing image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze image',
      error: error.message 
    });
  }
};

// Get available AI models
export const getAIModels = async (req, res) => {
  try {
    console.log('🔧 Fetching available AI models');
    
    const models = groqService.getAvailableModels();
    const currentModel = groqService.currentModel;

    console.log(`✅ Found ${models.length} available models, current: ${currentModel}`);

    res.json({
      success: true,
      data: {
        models: models,
        currentModel: currentModel,
        count: models.length
      },
      message: 'AI models retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting AI models:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get AI models',
      error: error.message 
    });
  }
};

// Switch AI model
export const switchAIModel = async (req, res) => {
  try {
    const { model } = req.body;
    
    console.log(`🔄 Request to switch AI model to: ${model}`);

    if (!model) {
      return res.status(400).json({ 
        success: false, 
        message: 'Model name is required' 
      });
    }

    const success = groqService.setModel(model);
    
    if (success) {
      console.log(`✅ Successfully switched to model: ${model}`);
      res.json({ 
        success: true, 
        message: `Switched to ${model} successfully`, 
        currentModel: model 
      });
    } else {
      console.log(`❌ Model not available: ${model}`);
      res.status(400).json({ 
        success: false, 
        message: 'Model not available. Please choose from available models.',
        availableModels: groqService.getAvailableModels()
      });
    }
    
  } catch (error) {
    console.error('❌ Error switching AI model:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to switch AI model',
      error: error.message 
    });
  }
};

// Get conversation statistics
export const getConversationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const aiUserId = Message.getAIUserId();

    console.log(`📊 Getting conversation stats for user ${userId}`);

    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: userId, recipient: aiUserId },
        { sender: aiUserId, recipient: userId }
      ]
    });

    const userMessages = await Message.countDocuments({
      sender: userId,
      recipient: aiUserId
    });

    const aiMessages = await Message.countDocuments({
      sender: aiUserId,
      recipient: userId
    });

    const latestMessage = await Message.findOne({
      $or: [
        { sender: userId, recipient: aiUserId },
        { sender: aiUserId, recipient: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .select('createdAt')
    .lean();

    const stats = {
      totalMessages,
      userMessages,
      aiMessages,
      latestActivity: latestMessage?.createdAt || null,
      conversationRatio: userMessages > 0 ? (aiMessages / userMessages).toFixed(2) : 0
    };

    console.log(`✅ Conversation stats: ${totalMessages} total messages`);

    res.json({
      success: true,
      data: stats,
      message: 'Conversation statistics retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting conversation stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get conversation statistics',
      error: error.message 
    });
  }
};

// Search messages by keyword
export const searchMessages = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;
    const aiUserId = Message.getAIUserId();

    console.log(`🔍 Searching messages for: "${query}" by user ${userId}`);

    if (!query?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const searchRegex = new RegExp(query.trim(), 'i');

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: aiUserId },
        { sender: aiUserId, recipient: userId }
      ],
      content: searchRegex
    })
    .populate('sender', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .sort({ createdAt: -1 }) // Latest matches first
    .limit(50) // Limit results
    .lean();

    console.log(`✅ Found ${messages.length} messages matching search`);

    res.json({
      success: true,
      data: messages,
      count: messages.length,
      query: query,
      message: 'Search completed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error searching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search messages',
      error: error.message 
    });
  }
};

// Export chat history
export const exportChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const aiUserId = Message.getAIUserId();
    const { format = 'json' } = req.query;

    console.log(`📤 Exporting chat history for user ${userId} in ${format} format`);

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: aiUserId },
        { sender: aiUserId, recipient: userId }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: 1 })
    .lean();

    if (format === 'txt') {
      // Format as plain text
      const textContent = messages.map(msg => 
        `[${new Date(msg.createdAt).toLocaleString()}] ${msg.sender.name}: ${msg.content}`
      ).join('\n\n');

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=chat-history.txt');
      return res.send(textContent);
    }

    // Default JSON format
    res.json({
      success: true,
      data: messages,
      count: messages.length,
      exportedAt: new Date().toISOString(),
      format: 'json',
      message: 'Chat history exported successfully'
    });
    
  } catch (error) {
    console.error('❌ Error exporting chat history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export chat history',
      error: error.message 
    });
  }
};