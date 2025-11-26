export default {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/zara-ai'
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'zara-super-secret-jwt-key-change-in-production',
    expiresIn: '7d'
  },
  
  // Email configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'password',
    from: process.env.SMTP_FROM || 'welcome@zara.ai'
  },
  
  // Client configuration
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173'
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100 // limit each IP to 100 requests per windowMs
  }
}