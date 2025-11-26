// services/groq.service.js
import fetch from 'node-fetch';
import dotenv from "dotenv";

dotenv.config();

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY?.trim();
    console.log('🔑 API Key loaded:', this.apiKey ? 'Yes' : 'No');
    console.log('🔑 API Key length:', this.apiKey?.length);
    
    this.apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    
    // UPDATED MODELS LIST - Current working models
    this.availableModels = [
      "llama-3.1-8b-instant",      // New model name
      "llama-3.1-70b-versatile",   // New model name  
      "mixtral-8x7b-32768",
      "gemma2-9b-it"               // Updated Gemma
    ];
    
    this.currentModel = this.availableModels[0]; // Use new model
    console.log(`✅ Groq AI Service initialized with model: ${this.currentModel}`);
  }

  async generateResponse(userMessage, chatHistory = []) {
    // Check if API key is valid
    if (!this.apiKey || !this.apiKey.startsWith('gsk_')) {
      console.error('❌ Invalid API Key format');
      return this.generateEnhancedResponse(userMessage);
    }

    try {
      console.log('🔄 Generating response for:', userMessage.substring(0, 50));
      
      const messages = [
        {
          role: "system",
          content: "You are Zara AI, a helpful and friendly assistant created By Ajay Arumugam. Keep responses clear and concise."
        },
        {
          role: "user", 
          content: userMessage
        }
      ];

      console.log('📡 Using model:', this.currentModel);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.currentModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.9
        })
      });

      console.log('🔍 API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        if (response.status === 400) {
          // Try with different model if first fails
          return this.tryAlternativeModel(userMessage);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        console.log('✅ REAL GROQ AI RESPONSE SUCCESS!');
        return data.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from Groq API');
      }

    } catch (error) {
      console.error('❌ Groq API Error:', error.message);
      return this.generateEnhancedResponse(userMessage);
    }
  }

  async tryAlternativeModel(userMessage) {
    console.log('🔄 Trying alternative model...');
    
    // Try different models
    const alternativeModels = [
      "llama-3.1-70b-versatile",
      "mixtral-8x7b-32768", 
      "gemma2-9b-it"
    ];
    
    for (const model of alternativeModels) {
      try {
        console.log(`🔄 Trying model: ${model}`);
        
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7,
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with model: ${model}`);
          this.currentModel = model; // Switch to working model
          return data.choices[0].message.content;
        }
      } catch (error) {
        console.log(`❌ Model ${model} failed:`, error.message);
      }
    }
    
    throw new Error('All models failed');
  }

  generateEnhancedResponse(userMessage) {
    console.log('🔄 Using enhanced response');
    const message = userMessage.toLowerCase().trim();
    
    if (message.includes('hi') || message.includes('hello')) {
      return `Hello! 👋 I'm Zara AI, your intelligent assistant. 

I'm here to help you with:
• Programming and code questions
• Technical explanations  
• Problem solving
• Learning resources

What would you like to explore today?`;
    }

    if (message.includes('accountancy') || message.includes('accounting')) {
      return `## 📊 Accountancy Overview

Accountancy involves recording, classifying, and summarizing financial transactions.

### Key Areas:
- **Financial Accounting**: Preparing financial statements
- **Management Accounting**: Internal decision-making  
- **Tax Accounting**: Tax compliance
- **Auditing**: Financial verification

### Basic Principles:
- Revenue Recognition
- Matching Principle  
- Historical Cost
- Going Concern

Need help with specific accounting concepts?`;
    }

    return `I understand you're asking about: **${userMessage}**

I'm Zara AI, ready to help you with programming, technical concepts, and learning resources. 

What specific topic would you like me to explain?`;
  }

  setModel(modelName) {
    if (this.availableModels.includes(modelName)) {
      this.currentModel = modelName;
      console.log(`🔄 Switched to model: ${modelName}`);
      return true;
    }
    return false;
  }

  getAvailableModels() {
    return this.availableModels;
  }

  async analyzeImage(imageBuffer, mimeType, prompt) {
    return "I understand you've uploaded an image. Currently focused on text conversations. For image analysis, consider dedicated vision AI services.";
  }
}

export default new GroqService();
