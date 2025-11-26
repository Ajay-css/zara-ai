// test-groq-new.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

console.log('🔧 Testing Groq with Updated Models\n');

import groqService from './services/groq.service.js';

async function testGroq() {
  console.log('🧪 Starting Groq API Test...\n');
  
  try {
    // Test 1: Simple greeting
    console.log('1. Testing with current model...');
    const response1 = await groqService.generateResponse("Hello, who are you?");
    console.log('✅ Response:', response1.substring(0, 150) + '...\n');
    
    console.log('🎉 REAL AI RESPONSE WORKING!');
    console.log('Current active model:', groqService.currentModel);
    
  } catch (error) {
    console.error('❌ All models failed:', error.message);
    console.log('Using enhanced responses only.');
  }
}

testGroq();