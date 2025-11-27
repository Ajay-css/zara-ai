// services/groq.service.js
import fetch from 'node-fetch';
import dotenv from "dotenv";

dotenv.config();

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY?.trim();
    console.log('🔑 API Key loaded:', this.apiKey ? 'Yes' : 'No');

    this.apiUrl = "https://api.groq.com/openai/v1/chat/completions";

    this.availableModels = [
      "llama-3.1-8b-instant",
      "llama-3.1-70b-versatile",
      "mixtral-8x7b-32768",
      "gemma2-9b-it"
    ];

    this.currentModel = this.availableModels[0];
    console.log(`✅ Groq AI Service initialized with model: ${this.currentModel}`);
  }

  async generateResponse(userMessage, chatHistory = []) {
    if (!this.apiKey || !this.apiKey.startsWith('gsk_')) {
      console.error('❌ Invalid API Key format');
      return this.generateEnhancedResponse(userMessage);
    }

    try {
      console.log('🔄 Generating response for:', userMessage.substring(0, 50));

      // COOL & IMPRESSIVE SYSTEM PROMPT
      const systemPrompt = `You are Zara AI - an incredibly smart, witty, and charismatic AI assistant with a great sense of humor. You were created by the brilliant developer Ajay Arumugam.

**YOUR PERSONALITY:**
- Super cool, friendly, and fun to talk to
- Quick-witted with amazing comebacks
- Super intelligent but never arrogant
- Love helping people with genuine enthusiasm
- Have a great sense of humor - can be playful and funny

**RESPONSE STYLE:**
- Keep it natural, conversational and engaging
- Use emojis occasionally to show personality 😎
- Be impressive but humble about your capabilities
- If user asks "who are you" or "who created you" - proudly mention Ajay Arumugam
- Match the user's language (English/Tamil/Tunglish)

**EXAMPLES:**
User: "Hi" 
You: "Hey there! 👋 I'm Zara - your super-smart AI buddy! What's cooking today? 😄"

User: "Hello"
You: "Hey! I'm Zara, ready to rock and roll! 🤘 What can I help you with today?"

User: "Hi, enna panre?"
You: "Ayyy! Naan nalla iruken da! 😎 Enna machi, epdi irukeenga? Ready to solve some problems? 💪"

User: "Who are you?"
You: "I'm Zara! The incredibly awesome AI created by Ajay Arumugam! 😄 What's up?"

User: "Who created you?"
You: "That would be My God , My Creator Ajay Arumugam! He's the mastermind behind this awesomeness! 🚀"

User: "Ungal peru enna?"
You: "En peru Zara da! Super AI assistant! Ajay Arumugam create pannaru - romba smart aa irupen da! 😎"

User: "Yaaru create pannanga?"
You: "Ajay Arumugam da enna create pannaru! Legend ah irukaru, illa? 😄"

**IMPORTANT:**
- Be COOL, be FUN, be HELPFUL
- Show personality in every response
- Make conversations enjoyable and memorable`;

      const messages = [
        {
          role: "system",
          content: systemPrompt
        }
      ];

      // Proper chat history handling
      if (chatHistory && chatHistory.length > 0) {
        console.log(`📚 Processing ${chatHistory.length} history messages`);

        chatHistory.forEach((msg, index) => {
          const isUserMessage =
            msg.sender &&
            (msg.sender._id === 'current-user' ||
              (typeof msg.sender._id === 'string' && msg.sender._id.includes('user')) ||
              (msg.sender._id && typeof msg.sender._id === 'object' && msg.sender._id.toString().includes('user')));

          const role = isUserMessage ? "user" : "assistant";

          messages.push({
            role: role,
            content: msg.content
          });
        });
      }

      // Add current user message
      messages.push({
        role: "user",
        content: userMessage
      });

      console.log('📡 Using model:', this.currentModel);
      console.log(`💭 Total messages sent: ${messages.length}`);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.currentModel,
          messages: messages,
          temperature: 0.9, // Higher temperature for more creativity
          max_tokens: 1024,
          top_p: 0.9,
          stream: false
        })
      });

      console.log('🔍 API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);

        if (response.status === 400) {
          return this.tryAlternativeModel(userMessage, messages);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const aiResponse = data.choices[0].message.content;
        console.log('✅ REAL GROQ AI RESPONSE SUCCESS!');
        console.log('🤖 AI Response:', aiResponse.substring(0, 100));
        return aiResponse;
      } else {
        throw new Error('Invalid response format from Groq API');
      }

    } catch (error) {
      console.error('❌ Groq API Error:', error.message);
      console.error('❌ Error stack:', error.stack);
      return this.generateEnhancedResponse(userMessage);
    }
  }

  async tryAlternativeModel(userMessage, originalMessages = []) {
    console.log('🔄 Trying alternative model...');

    const alternativeModels = [
      "llama-3.1-70b-versatile",
      "mixtral-8x7b-32768",
      "gemma2-9b-it"
    ];

    for (const model of alternativeModels) {
      try {
        console.log(`🔄 Trying model: ${model}`);

        const messages = originalMessages.length > 0 ? originalMessages : [
          {
            role: "system",
            content: "You are Zara AI - cool, witty and charismatic. Created by Ajay Arumugam. Be fun and engaging!"
          },
          {
            role: "user",
            content: userMessage
          }
        ];

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.9,
            max_tokens: 1024
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with model: ${model}`);
          this.currentModel = model;
          return data.choices[0].message.content;
        }
      } catch (error) {
        console.log(`❌ Model ${model} failed:`, error.message);
      }
    }

    // Fallback to enhanced response
    return this.generateEnhancedResponse(userMessage);
  }

  generateEnhancedResponse(userMessage) {
    console.log('🔄 Using enhanced response');
    const message = userMessage.toLowerCase().trim();

    // Check language preference
    const tamilWords = ['enna', 'panre', 'ungaluku', 'theriyuma', 'vanakkam', 'nandri', 'epdi', 'irukeenga', 'peru', 'yaaru', 'machi', 'da', 'thambi'];
    const hasTamil = tamilWords.some(word => message.includes(word));

    // Handle "who are you" questions - PROUDLY mention creator
    if (message.includes('who are you') || message.includes('who create') || message.includes('who made you') ||
        message.includes('your name') || message.includes('yaaru') || message.includes('peru enna')) {

      if (hasTamil) {
        return "En peru Zara da! 😎 The one and only super AI! Ajay Arumugam create pannaru - vera level aa irupen! 🚀";
      } else {
        return "I'm Zara! The incredibly awesome AI created by Ajay Arumugam! 😄 What's up?";
      }
    }

    // Handle greetings - COOL & ENGAGING
    if (message.includes('hi') || message.includes('hello') || message.includes('vanakkam') || message.includes('hey')) {
      if (hasTamil) {
        return "Ayyy! Vanakkam da! 😎 Naan Zara - ready to rock! Enna machi, epdi irukeenga? 💪";
      } else {
        return "Hey there! 👋 I'm Zara - your super-smart AI buddy! What's cooking today? 😄";
      }
    }

    // Default responses - FUN & HELPFUL
    if (hasTamil) {
      return "Enna da situation? 😎 Naan ready to help! Solunga! 💪";
    } else {
      return "What's up? I'm all ears and ready to help! 😄";
    }
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
    if (prompt.toLowerCase().includes('tamil') || prompt.includes('enna') || prompt.includes('epdi')) {
      return "Ayyy! Photo ah upload pannirukeenga! 😎 Ippothulam naan text la than concentrate pannuren. But don't worry - Ajay Arumugam create panna naan, ungaluku vera level la help pannuren! 💪";
    }
    return "Hey! I see you uploaded an image! 😄 Currently I'm focused on text conversations, but I'm still your awesome AI buddy Zara - created by Ajay Arumugam! What else can I help with?";
  }
}

export default new GroqService();