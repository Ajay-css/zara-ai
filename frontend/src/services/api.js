// API service for Zara AI frontend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  // Add auth token if available
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed')
    }
    
    return data
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  googleAuth: (tokenId) => apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ tokenId })
  }),
  
  forgotPassword: (email) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  
  resetPassword: (token, password) => apiRequest(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password })
  })
}

// Chat API
export const chatAPI = {
  getChatHistory: () => apiRequest('/chat/history'),
  
  getMessages: (userId) => apiRequest(`/chat/${userId}`),
  
  sendMessage: (messageData) => apiRequest('/chat/send', {
    method: 'POST',
    body: JSON.stringify(messageData)
  }),
  
  deleteMessage: (messageId) => apiRequest(`/chat/${messageId}`, {
    method: 'DELETE'
  })
}

// User API
export const userAPI = {
  getProfile: () => apiRequest('/users/profile'),
  
  updateProfile: (profileData) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  
  updatePreferences: (preferences) => apiRequest('/users/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences)
  })
}