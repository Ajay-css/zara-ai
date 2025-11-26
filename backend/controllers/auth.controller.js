import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import { sendWelcomeEmail } from '../utils/email.utils.js'

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    })

    await user.save()

    // Send welcome email (but don't wait for it or fail registration)
    sendWelcomeEmail(email, name)
      .then(() => console.log('✅ Welcome email sent successfully'))
      .catch(err => console.log('⚠️ Welcome email failed but registration completed'))

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'zara-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'zara-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
}

// Google authentication
export const googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body

    // For demo - create or find user based on Google auth
    // In production, verify Google token properly
    
    const mockUser = {
      id: 'google-user-123',
      name: 'Google User',
      email: 'google@example.com'
    }

    const token = jwt.sign(
      { userId: mockUser.id },
      process.env.JWT_SECRET || 'zara-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Google authentication successful',
      token,
      user: mockUser
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ message: 'Server error during Google authentication' })
  }
}

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ 
        message: 'If an account with that email exists, password reset instructions have been sent' 
      })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET || 'zara-secret-key',
      { expiresIn: '1h' }
    )

    // Send reset email (but don't fail the request)
    const resetSent = await sendPasswordResetEmail(email, resetToken)
    
    if (resetSent) {
      console.log('✅ Password reset email sent')
    } else {
      console.log('⚠️ Password reset email failed to send')
    }

    res.json({
      message: 'If an account with that email exists, password reset instructions have been sent'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Server error during password reset' })
  }
}

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zara-secret-key')
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid reset token' })
    }

    // Find user and update password
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' })
    }

    // Hash new password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    user.password = hashedPassword
    await user.save()

    res.json({
      message: 'Password reset successful'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired' })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token' })
    }
    
    res.status(500).json({ message: 'Server error during password reset' })
  }
}