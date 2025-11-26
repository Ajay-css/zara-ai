// Production deployment test script
const https = require('https')

// Test URLs (update these with your actual deployed URLs)
const urls = [
  { name: 'Render Backend Health', url: 'https://your-render-backend-url.onrender.com/health', expectedStatus: 200 },
  { name: 'Render Backend Auth', url: 'https://your-render-backend-url.onrender.com/api/auth', expectedStatus: 404 }
]

console.log('Testing Zara AI Production Deployment...\n')

let passedTests = 0
let totalTests = urls.length

urls.forEach((test, index) => {
  const url = new URL(test.url)
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'GET',
    headers: {
      'User-Agent': 'Zara-AI-Test-Client/1.0'
    }
  }
  
  const req = https.request(options, (res) => {
    if (res.statusCode === test.expectedStatus) {
      console.log(`✓ ${test.name}: PASSED (Status ${res.statusCode})`)
      passedTests++
    } else {
      console.log(`✗ ${test.name}: FAILED (Expected ${test.expectedStatus}, Got ${res.statusCode})`)
    }
    
    // Check if all tests are completed
    if (index === totalTests - 1) {
      console.log(`\nTest Results: ${passedTests}/${totalTests} tests passed`)
      
      if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Production deployment is successful.')
      } else {
        console.log('❌ Some tests failed. Please check the deployment.')
      }
    }
  })
  
  req.on('error', (error) => {
    console.log(`✗ ${test.name}: FAILED (${error.message})`)
    
    // Check if all tests are completed
    if (index === totalTests - 1) {
      console.log(`\nTest Results: ${passedTests}/${totalTests} tests passed`)
      console.log('❌ Some tests failed. Please check the deployment.')
    }
  })
  
  req.end()
})