import nodemailer from 'nodemailer'

// Test email configuration on startup
export const testEmailConfig = async () => {
  try {
    // Check if email credentials exist
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('❌ Email credentials missing - skipping email setup')
      return false
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.verify()
    console.log('✅ Email server is ready to send messages')
    return true
  } catch (error) {
    console.error('❌ Email server configuration error:', error)
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('💡 SOLUTION: Use Google App Password instead of regular password!')
      console.error('💡 STEPS TO FIX:')
      console.error('1. Go to: https://myaccount.google.com/security')
      console.error('2. Enable "2-Step Verification"')
      console.error('3. Go to "App passwords"')
      console.error('4. Generate app password for "Mail"')
      console.error('5. Use that 16-digit password in .env file')
    }
    
    return false
  }
}

// Send welcome email with better error handling
export const sendWelcomeEmail = async (to, name) => {
  try {
    // Check if we have email credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email credentials not configured - skipping welcome email')
      return null
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    const info = await transporter.sendMail({
      from: `"Zara AI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'Welcome to Zara AI! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Zara AI! 👋</h1>
          </div>
          <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #374151;">Hello ${name}! 💫</h2>
            <p style="color: #6b7280; line-height: 1.6;">Thank you for joining Zara AI!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}" 
                 style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; padding: 14px 32px; 
                        text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Start Chatting Now 🚀
              </a>
            </div>
          </div>
        </div>
      `
    })

    console.log('✅ Welcome email sent: %s', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message)
    return null
  }
}

// Simple password reset email
export const sendPasswordResetEmail = async (to, resetToken) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email credentials not configured - skipping reset email')
      return null
    }

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    const info = await transporter.sendMail({
      from: `"Zara AI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'Password Reset - Zara AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
        </div>
      `
    })

    console.log('✅ Password reset email sent')
    return info
  } catch (error) {
    console.error('❌ Error sending reset email:', error.message)
    return null
  }
}