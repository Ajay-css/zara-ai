import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI('AIzaSyBa8SSIb-3Ti2WxqMza2PyEshMbtXsp908');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log('🔄 Testing Gemini API...');
    const result = await model.generateContent('Hello, respond with "API is working"');
    const response = await result.response;
    
    console.log('✅ API Response:', response.text());
    console.log('🎉 Gemini API is working correctly!');
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.log('💡 Possible issues:');
    console.log('1. API key might be invalid or restricted');
    console.log('2. Billing might not be enabled for Gemini API');
    console.log('3. Regional restrictions might apply');
  }
}

testGemini();