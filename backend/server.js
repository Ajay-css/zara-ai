import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { testEmailConfig } from './utils/email.utils.js'
import connectDB from './config/db.js'

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Test email configuration on startup
testEmailConfig().then(success => {
  if (success) {
    console.log('✅ Email service configured successfully')
  } else {
    console.log('⚠️ Email service not configured - continuing without email functionality')
  }
})

// Import routes
import authRoutes from './routes/auth.routes.js'
import chatRoutes from './routes/chat.routes.js'
import userRoutes from './routes/user.routes.js'

// Import middleware
import { errorHandler } from './middleware/error.middleware.js'

// Initialize app
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/users', userRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Zara AI Backend is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Zara AI Backend server running on port ${PORT}`)
})

export default app