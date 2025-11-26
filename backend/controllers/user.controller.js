import User from '../models/User.model.js'

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    })
  }
}

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body
    
    // Build update object
    const updateFields = {}
    if (name) updateFields.name = name
    if (email) updateFields.email = email
    if (avatar) updateFields.avatar = avatar
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    ).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    })
  }
}

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const { language, theme } = req.body
    
    // Build update object
    const updateFields = {}
    if (language) updateFields.language = language
    if (theme) updateFields.theme = theme
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    ).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    })
  }
}