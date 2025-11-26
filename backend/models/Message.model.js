// models/Message.model.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'image_analysis'],
    default: 'text'
  },
  attachments: [{
    url: String,
    filename: String,
    mimetype: String
  }]
}, {
  timestamps: true
});

// Static method to get AI user ID
messageSchema.statics.getAIUserId = function() {
  return new mongoose.Types.ObjectId('000000000000000000000001');
};

// Index for better performance
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', messageSchema);